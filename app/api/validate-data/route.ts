import { NextRequest, NextResponse } from "next/server";
import {
  normalizeEmail,
  validateEmail,
  deduplicateEmails,
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
  console.error("[VALIDATE-DATA] ===== INICIO DE VALIDACIÓN DE DATOS =====");
  
  try {
    const body = await req.json();
    const { emails, params } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: "No se recibieron emails para validar" }, { status: 400 });
    }

    console.error("[VALIDATE-DATA] Emails recibidos:", emails.length);

    // Normalizar emails
    const normalizedEmails = emails.map((email: string) => normalizeEmail(email)).filter((e: string) => e);

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

    console.error("[VALIDATE-DATA] Validación completada. Válidos:", validEmails.length, "Inválidos:", invalidEmails.length);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("[VALIDATE-DATA ERROR]:", error);
    return NextResponse.json(
      { 
        error: `Error procesando datos: ${error.message}`,
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
