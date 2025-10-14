/**
 * Utilidades de normalización y validación de emails
 * según recomendaciones de Doppler y mejores prácticas
 */

export interface ValidationParams {
  allowRoleEmails?: boolean;
  filterNonTargetTLDs?: boolean;
  checkMX?: boolean;
  checkAntiquity?: boolean;
  targetTLDs?: string[];
  whitelistedDomains?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

// Lista de correos genéricos/de rol
const ROLE_EMAIL_PREFIXES = [
  "ventas",
  "info",
  "informacion",
  "administracion",
  "contacto",
  "no-reply",
  "noreply",
  "postmaster",
  "abuse",
  "webmaster",
  "support",
  "soporte",
  "ayuda",
  "help",
  "admin",
  "root",
  "sales",
  "marketing",
  "hr",
  "rrhh",
];

// Typos comunes de dominios
const DOMAIN_TYPOS = [
  "gmial",
  "gmal",
  "gmali",
  "hotmal",
  "hotmial",
  "yahou",
  "yaho",
  "outlok",
  "outloo",
  "outluk",
];

// TLDs inválidos comunes
const INVALID_TLDS = [".con", ".comm", ".cpm", ".cm", ".om"];

// TLDs de países objetivo (Latinoamérica según Doppler)
const TARGET_TLDS = [
  // Argentina
  ".ar",
  ".com.ar",
  ".gob.ar",
  ".gov.ar",
  ".edu.ar",
  // Latinoamérica
  ".mx", ".com.mx", ".gob.mx", // México
  ".co", ".com.co", ".gov.co", // Colombia
  ".cl", ".com.cl", ".gob.cl", // Chile
  ".pe", ".com.pe", ".gob.pe", // Perú
  ".br", ".com.br", ".gov.br", // Brasil
  ".uy", ".com.uy", ".gub.uy", // Uruguay
  ".py", ".com.py", ".gov.py", // Paraguay
  ".bo", ".com.bo", ".gov.bo", // Bolivia
  ".ec", ".com.ec", ".gov.ec", // Ecuador
  ".ve", ".com.ve", ".gov.ve", // Venezuela
  ".cr", ".com.cr", ".gov.cr", // Costa Rica
  ".gt", ".com.gt", ".gov.gt", // Guatemala
  ".hn", ".com.hn", ".gov.hn", // Honduras
  ".ni", ".com.ni", ".gov.ni", // Nicaragua
  ".pa", ".com.pa", ".gov.pa", // Panamá
  ".sv", ".com.sv", ".gov.sv", // El Salvador
  ".do", ".com.do", ".gov.do", // República Dominicana
  // TLDs globales
  ".com",
  ".net",
  ".org",
  ".edu",
];

// Dominios siempre válidos (whitelist)
const WHITELISTED_DOMAINS = [
  "buenosaires.gob.ar",
  "gmail.com",
  "yahoo.com", 
  "yahoo.com.ar",
  "outlook.com",
  "hotmail.com",
  "live.com",
];

/**
 * Normaliza un email eliminando espacios, convirtiendo a minúsculas
 * y aplicando normalización Unicode NFKC
 */
export function normalizeEmail(email: string): string {
  if (!email) return "";

  let normalized = email.trim();

  // Eliminar 'mailto:' si está presente
  if (normalized.toLowerCase().startsWith("mailto:")) {
    normalized = normalized.substring(7);
  }

  // Convertir a minúsculas
  normalized = normalized.toLowerCase();

  // Normalización Unicode NFKC
  normalized = normalized.normalize("NFKC");

  // Eliminar espacios internos
  normalized = normalized.replace(/\s+/g, "");

  // Eliminar comillas
  normalized = normalized.replace(/["']/g, "");

  // Eliminar caracteres invisibles (zero-width, etc.)
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // Reemplazar comas por puntos en el dominio (error común)
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex > 0) {
    const localPart = normalized.substring(0, atIndex);
    const domainPart = normalized.substring(atIndex + 1).replace(/,/g, ".");
    normalized = `${localPart}@${domainPart}`;
  }

  return normalized;
}

/**
 * Valida un email según las reglas especificadas
 */
export function validateEmail(
  email: string,
  params: ValidationParams = {}
): ValidationResult {
  const {
    allowRoleEmails = false,
    filterNonTargetTLDs = false,
    targetTLDs = TARGET_TLDS,
    whitelistedDomains = WHITELISTED_DOMAINS,
  } = params;

  // A. Formato básico RFC simplificado
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, reason: "Formato inválido" };
  }

  const [localPart, domainPart] = email.split("@");

  // Verificar doble punto consecutivo ANTES de otras validaciones
  if (domainPart.includes("..")) {
    return { isValid: false, reason: "Dominio con puntos consecutivos" };
  }

  // Verificar dominio en lista blanca (siempre válido)
  if (whitelistedDomains.some((domain) => domainPart.endsWith(domain))) {
    return { isValid: true };
  }

  // B. Doppler: Mínimo 4 caracteres antes de "@"
  if (localPart.length < 4) {
    return { isValid: false, reason: "Menos de 4 caracteres antes de @ (Doppler)" };
  }

  // C. Doppler: Local-part no sólo numérico
  if (/^\d+$/.test(localPart)) {
    return { isValid: false, reason: "Sólo números antes de @ (Doppler)" };
  }

  // C2. Doppler: Patrones sospechosos - emails aleatorios o generados
  // Emails que parecen aleatorios (muchas consonantes seguidas, sin vocales, etc.)
  const suspiciousPatterns = [
    /^[a-z]{4,}$/i, // Solo letras iguales o muy repetitivas: aaaa@, bbbb@
    /^(test|prueba|ejemplo|example|sample|demo|fake|false|temp|temporal|basura|spam)[0-9]*$/i, // Emails de prueba
    /^[0-9]{4,8}$/,  // Muchos números seguidos (ya cubierto arriba pero refinado)
    /^(asdf|qwerty|abc|xyz|aaa|bbb|ccc|ddd|xxx|zzz)[0-9]*$/i, // Patrones de teclado
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(localPart))) {
    return { isValid: false, reason: "Patrón sospechoso o email de prueba (Doppler)" };
  }

  // D. Typos/errores evidentes en dominio
  const domainLower = domainPart.toLowerCase();

  // Verificar typos comunes
  if (DOMAIN_TYPOS.some((typo) => domainLower.includes(typo))) {
    return { isValid: false, reason: "Dominio con typo detectado" };
  }

  // Verificar TLDs inválidos
  if (INVALID_TLDS.some((tld) => domainLower.endsWith(tld))) {
    return { isValid: false, reason: "TLD inválido" };
  }


  // Verificar que tenga al menos un punto en el dominio
  if (!domainPart.includes(".")) {
    return { isValid: false, reason: "Dominio sin TLD" };
  }

  // D2. Doppler: Dominios sospechosos o temporales
  const suspiciousDomains = [
    "tempmail", "temp-mail", "10minutemail", "guerrillamail", "mailinator",
    "throwaway", "trashmail", "fakeinbox", "maildrop", "yopmail",
    "sharklasers", "guerrillamail", "grr.la", "spam4.me", "dispostable"
  ];

  if (suspiciousDomains.some(domain => domainLower.includes(domain))) {
    return { isValid: false, reason: "Dominio temporal o desechable (Doppler)" };
  }

  // D3. Verificar que el dominio no empiece o termine con guión
  const domainParts = domainPart.split(".");
  for (const part of domainParts) {
    if (part.startsWith("-") || part.endsWith("-")) {
      return { isValid: false, reason: "Dominio con guiones mal posicionados" };
    }
  }

  // D4. Verificar que el TLD sea válido (al menos 2 caracteres)
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, reason: "TLD demasiado corto" };
  }

  // E. Doppler: Correos genéricos de rol (si no están permitidos)
  if (!allowRoleEmails) {
    const localLower = localPart.toLowerCase();
    if (ROLE_EMAIL_PREFIXES.some((prefix) => localLower === prefix || localLower.startsWith(`${prefix}.`))) {
      return { isValid: false, reason: "Correo de rol (genérico) - Doppler" };
    }
  }

  // F. Doppler: Filtro geográfico (TLDs de Latinoamérica)
  if (filterNonTargetTLDs) {
    const hasTargetTLD = targetTLDs.some((tld) => domainLower.endsWith(tld));
    if (!hasTargetTLD) {
      return { isValid: false, reason: "TLD fuera de Latinoamérica (Doppler)" };
    }
  }

  return { isValid: true };
}

/**
 * Deduplica un array de emails (case-insensitive)
 */
export function deduplicateEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const email of emails) {
    const normalized = email.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(email);
    }
  }

  return result;
}

/**
 * Extrae emails de una columna de datos
 * Intenta detectar columnas con nombres típicos de email
 */
export function extractEmailColumn(data: any[]): string[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const headers = Object.keys(firstRow);

  // Buscar columnas con nombres típicos de email
  const emailHeaders = ["email", "mail", "correo", "e-mail", "correo electronico", "correo electrónico"];
  
  const emailColumn = headers.find((header) =>
    emailHeaders.some((eh) => header.toLowerCase().includes(eh))
  );

  if (emailColumn) {
    return data.map((row) => String(row[emailColumn] || "")).filter((e) => e.trim() !== "");
  }

  // Si no encontramos una columna con nombre de email,
  // intentar usar la primera columna
  const firstHeader = headers[0];
  if (firstHeader) {
    return data.map((row) => String(row[firstHeader] || "")).filter((e) => e.trim() !== "");
  }

  return [];
}


