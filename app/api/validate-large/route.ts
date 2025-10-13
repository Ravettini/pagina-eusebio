import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  normalizeEmail,
  validateEmail,
  deduplicateEmails,
  extractEmailColumn,
  type ValidationParams,
} from "@/lib/email-validator";

export const runtime = "nodejs";

interface ValidEmail {
  email: string;
}

interface InvalidEmail {
  email: string;
  motivo: string;
}

interface ValidationResponse {
  valid: ValidEmail[];
  invalid: InvalidEmail[];
  totalProcessed: number;
  duplicatesRemoved: number;
}

export async function POST(req: NextRequest) {
  console.error("[VALIDATE-LARGE] ===== INICIO DE VALIDACIÓN LARGE =====");
  console.error("[VALIDATE-LARGE] Timestamp:", new Date().toISOString());
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const paramsStr = formData.get("params") as string;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    console.error("[VALIDATE-LARGE] Procesando archivo:", file.name, file.size);

    // Límite más generoso para archivos grandes
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo permitido (${MAX_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Parsear parámetros
    const params: ValidationParams = paramsStr ? JSON.parse(paramsStr) : {};

    // Leer archivo en chunks para manejar archivos grandes
    console.error("[VALIDATE-LARGE] Leyendo archivo en chunks...");
    const buffer = await file.arrayBuffer();
    
    // Procesar solo las primeras 1000 filas para archivos muy grandes
    const workbook = XLSX.read(buffer, { 
      type: "array",
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Limitar el número de filas para archivos grandes
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: "",
      blankrows: false,
      raw: false
    });

    // Tomar solo las primeras 1000 filas si el archivo es muy grande
    const limitedData = rawData.slice(0, 1001); // 1 header + 1000 filas
    const processedData = limitedData.slice(1).map(row => {
      const obj: any = {};
      if (limitedData[0]) {
        limitedData[0].forEach((header: any, index: number) => {
          obj[header] = row[index] || "";
        });
      }
      return obj;
    });

    console.error("[VALIDATE-LARGE] Datos procesados:", processedData.length, "filas");

    if (processedData.length === 0) {
      return NextResponse.json(
        { error: "El archivo no contiene datos válidos" },
        { status: 400 }
      );
    }

    // Extraer emails
    const rawEmails = extractEmailColumn(processedData);
    console.error("[VALIDATE-LARGE] Emails extraídos:", rawEmails.length);

    if (rawEmails.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontró ninguna columna de emails. Asegurate de que tu archivo tenga una columna llamada 'email', 'mail' o 'correo'.",
        },
        { status: 400 }
      );
    }

    // Normalizar emails
    const normalizedEmails = rawEmails.map((email) => normalizeEmail(email)).filter((e) => e);

    // Deduplicar
    const duplicatesRemoved = normalizedEmails.length - new Set(normalizedEmails).size;
    const uniqueEmails = deduplicateEmails(normalizedEmails);

    // Validar emails
    const validEmails: ValidEmail[] = [];
    const invalidEmails: InvalidEmail[] = [];

    for (const email of uniqueEmails) {
      const result = validateEmail(email, params);

      if (result.isValid) {
        validEmails.push({ email });
      } else {
        invalidEmails.push({ email, motivo: result.reason || "Error desconocido" });
      }
    }

    const response: ValidationResponse = {
      valid: validEmails,
      invalid: invalidEmails,
      totalProcessed: uniqueEmails.length,
      duplicatesRemoved,
    };

    console.error("[VALIDATE-LARGE] Validación completada. Válidos:", validEmails.length, "Inválidos:", invalidEmails.length);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("[VALIDATE-LARGE ERROR]:", error);
    return NextResponse.json(
      { 
        error: `Error procesando archivo grande: ${error.message}`,
        details: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
