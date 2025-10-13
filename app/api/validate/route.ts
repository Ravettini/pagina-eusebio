import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  normalizeEmail,
  validateEmail,
  deduplicateEmails,
  extractEmailColumn,
  type ValidationParams,
} from "@/lib/email-validator";

// Forzar Node.js runtime (no Edge)
export const runtime = "nodejs";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760", 10);

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
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const paramsStr = formData.get("params") as string;

    // Validar archivo
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Validar tipo MIME y extensión
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!allowedMimes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Formato de archivo no permitido. Sólo se aceptan archivos .xlsx o .csv" },
        { status: 400 }
      );
    }

    // Parsear parámetros
    const params: ValidationParams = paramsStr ? JSON.parse(paramsStr) : {};

    // Leer archivo
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Obtener la primera hoja
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { error: "El archivo no contiene datos" },
        { status: 400 }
      );
    }

    // Extraer emails
    const rawEmails = extractEmailColumn(rawData);

    if (rawEmails.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se encontró ninguna columna de emails. Asegurate de que tu archivo tenga una columna llamada 'email', 'mail' o 'correo'.",
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

    // Si está habilitado el chequeo MX, procesar
    // NOTA: Esta funcionalidad está deshabilitada en Netlify (no soporta dns/promises)
    if (params.checkMX && process.env.ENABLE_MX_CHECK === "true") {
      try {
        // Importación dinámica para evitar errores en Netlify
        const { checkMultipleMX } = await import("@/lib/mx-validator");
        
        // Extraer dominios únicos de los emails válidos
        const domains = new Set(validEmails.map((v) => v.email.split("@")[1]));
        const mxResults = await checkMultipleMX(Array.from(domains), 5000);

        // Re-validar considerando MX
        const newValid: ValidEmail[] = [];
        for (const validEmail of validEmails) {
          const domain = validEmail.email.split("@")[1];
          const mxResult = mxResults.get(domain);

          if (mxResult && !mxResult.hasMX) {
            invalidEmails.push({ email: validEmail.email, motivo: "Sin registro MX" });
          } else {
            newValid.push(validEmail);
          }
        }

        validEmails.length = 0;
        validEmails.push(...newValid);
      } catch (error) {
        // Si falla la verificación MX (por ejemplo, en Netlify), continuar sin ella
        console.warn("MX check no disponible en este entorno:", error);
      }
    }

    const response: ValidationResponse = {
      valid: validEmails,
      invalid: invalidEmails,
      totalProcessed: uniqueEmails.length,
      duplicatesRemoved,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error procesando archivo:", error);
    return NextResponse.json(
      { error: `Error procesando el archivo: ${error.message}` },
      { status: 500 }
    );
  }
}




