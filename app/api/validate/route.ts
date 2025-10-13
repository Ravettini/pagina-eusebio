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
  console.error("[VALIDATE] ===== INICIO DE VALIDACIÓN =====");
  console.error("[VALIDATE] Timestamp:", new Date().toISOString());
  console.error("[VALIDATE] Content-Type:", req.headers.get("content-type"));
  console.error("[VALIDATE] Content-Length:", req.headers.get("content-length"));
  
  try {
    const formData = await req.formData();
    console.error("[VALIDATE] FormData recibido");
    console.error("[VALIDATE] FormData keys:", Array.from(formData.keys()));
    console.error("[VALIDATE] FormData entries:", Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value]));
    
    const file = formData.get("file") as File;
    const paramsStr = formData.get("params") as string;
    console.error("[VALIDATE] Archivo:", file?.name, "Tamaño:", file?.size, "Tipo:", file?.type);
    console.error("[VALIDATE] Params string:", paramsStr);

    // Validar archivo
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Validar tamaño - límite más conservador para Netlify
    const NETLIFY_LIMIT = 6 * 1024 * 1024; // 6MB límite de Netlify
    if (file.size > NETLIFY_LIMIT) {
      return NextResponse.json(
        { 
          error: `El archivo es demasiado grande para procesar en Netlify. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB. Límite: ${NETLIFY_LIMIT / 1024 / 1024}MB`,
          details: {
            fileSize: file.size,
            limit: NETLIFY_LIMIT,
            suggestion: "Por favor, divide tu archivo en archivos más pequeños o usa un archivo CSV en lugar de Excel"
          }
        },
        { status: 413 }
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
    console.error("[VALIDATE] Leyendo archivo...");
    const buffer = await file.arrayBuffer();
    console.error("[VALIDATE] Buffer creado, tamaño:", buffer.byteLength);
    const workbook = XLSX.read(buffer, { type: "array" });
    console.error("[VALIDATE] Workbook leído, hojas:", workbook.SheetNames.length);

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
    console.error("[VALIDATE] Extrayendo emails de", rawData.length, "filas");
    const rawEmails = extractEmailColumn(rawData);
    console.error("[VALIDATE] Emails extraídos:", rawEmails.length);

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

    console.error("[VALIDATE] Validación completada. Válidos:", validEmails.length, "Inválidos:", invalidEmails.length);
    console.error("[VALIDATE] ===== FIN DE VALIDACIÓN EXITOSA =====");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[VALIDATE ERROR] Error completo:", error);
    console.error("[VALIDATE ERROR] Stack:", error?.stack);
    console.error("[VALIDATE ERROR] Mensaje:", error?.message);
    console.error("[VALIDATE ERROR] Código:", error?.code);
    
    // Devolver información detallada del error para debugging
    const errorDetails = {
      error: `Error procesando el archivo: ${error.message || "Error desconocido"}`,
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}




