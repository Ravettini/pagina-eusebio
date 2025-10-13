/**
 * Validación de registros MX (para ejecutar en servidor)
 * NOTA: No disponible en Netlify serverless functions
 */

export interface MXValidationResult {
  hasMX: boolean;
  error?: string;
}

/**
 * Verifica si un dominio tiene registros MX válidos
 * Retorna error en ambientes que no soporten dns/promises (como Netlify)
 */
export async function checkMXRecords(domain: string): Promise<MXValidationResult> {
  try {
    // Intentar importar dinámicamente dns/promises
    // Esto fallará en Netlify y otros ambientes serverless
    const dns = await import("dns/promises");
    const addresses = await dns.resolveMx(domain);
    return { hasMX: addresses && addresses.length > 0 };
  } catch (error: any) {
    // Si no hay registros MX o el dominio no existe
    if (error.code === "ENOTFOUND" || error.code === "ENODATA") {
      return { hasMX: false };
    }
    // Si el módulo no está disponible (Netlify, etc.)
    if (error.code === "MODULE_NOT_FOUND" || error.message?.includes("dns")) {
      return { hasMX: false, error: "MX check no disponible en este entorno" };
    }
    // Otros errores (timeout, etc.)
    return { hasMX: false, error: error.message };
  }
}

/**
 * Verifica MX para múltiples dominios con timeout
 */
export async function checkMultipleMX(
  domains: string[],
  timeoutMs: number = 5000
): Promise<Map<string, MXValidationResult>> {
  const results = new Map<string, MXValidationResult>();

  const promises = domains.map(async (domain) => {
    try {
      const timeoutPromise = new Promise<MXValidationResult>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeoutMs)
      );

      const checkPromise = checkMXRecords(domain);
      const result = await Promise.race([checkPromise, timeoutPromise]);
      results.set(domain, result);
    } catch (error) {
      results.set(domain, { hasMX: false, error: "Timeout" });
    }
  });

  await Promise.allSettled(promises);
  return results;
}




