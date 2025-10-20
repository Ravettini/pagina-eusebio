/**
 * Procesador de archivos en el frontend para evitar límites de Netlify
 */

import * as XLSX from "xlsx";

export interface FileProcessingResult {
  emails: string[];
  totalRows: number;
  processedRows: number;
  originalData: any[];
  emailColumnName: string;
}

/**
 * Procesa un archivo Excel/CSV en el frontend y extrae emails
 */
export async function processFileInFrontend(file: File): Promise<FileProcessingResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("No se pudo leer el archivo"));
          return;
        }

        // Leer el workbook
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!rawData || rawData.length === 0) {
          reject(new Error("El archivo no contiene datos"));
          return;
        }

        // Extraer emails y encontrar la columna de email
        const emails = extractEmailColumn(rawData);
        const emailColumnName = findEmailColumnName(rawData);
        
        // Procesar todos los emails sin límite
        resolve({
          emails: emails,
          totalRows: rawData.length,
          processedRows: emails.length,
          originalData: rawData,
          emailColumnName: emailColumnName
        });

      } catch (error) {
        reject(new Error(`Error procesando archivo: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error leyendo el archivo"));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Función para verificar si un texto parece un email
function looksLikeEmail(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  // Verificar que no sea muy corto (al menos debe tener usuario@dominio.extension)
  if (trimmed.length < 5) return false;
  
  // Verificar que contenga exactamente un @
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return false;
  
  // Dividir en partes local y dominio
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  
  const [local, domain] = parts;
  
  // Verificar que la parte local no esté vacía y no tenga caracteres problemáticos
  if (!local || local.length === 0) return false;
  
  // Verificar que el dominio tenga al menos un punto
  if (!domain.includes('.')) return false;
  
  // Verificar que el dominio no termine o empiece con punto
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  // Regex más robusto para emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmed);
}

// Función para verificar si una columna parece contener CUILs, DNIs, etc.
function looksLikeDocumentColumn(columnName: string, sampleData: any[]): boolean {
  const columnLower = columnName.toLowerCase();
  
  // Verificar nombre de columna
  const documentKeywords = ["cuil", "dni", "cuit", "cedula", "cedula de identidad", "documento", "id", "legajo"];
  if (documentKeywords.some(keyword => columnLower.includes(keyword))) {
    return true;
  }
  
  // Analizar muestra de datos para detectar patrones de documentos
  const sampleSize = Math.min(10, sampleData.length);
  let numericCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const value = String(sampleData[i][columnName] || "").trim();
    
    // Si es principalmente numérico y tiene 8-11 dígitos, probablemente es un documento
    if (/^\d{8,11}$/.test(value)) {
      numericCount++;
    }
  }
  
  // Si más del 70% son números de 8-11 dígitos, probablemente es una columna de documentos
  return numericCount / sampleSize > 0.7;
}

// Función para analizar una columna y calcular qué tan probable es que contenga emails
function analyzeColumnForEmails(data: any[], columnName: string): number {
  if (!data || data.length === 0) return 0;
  
  // Verificar si parece ser una columna de documentos (CUIL, DNI, etc.) y excluirla
  if (looksLikeDocumentColumn(columnName, data)) {
    return 0;
  }
  
  // Tomar una muestra de las primeras 50 filas para analizar
  const sampleSize = Math.min(50, data.length);
  const sample = data.slice(0, sampleSize);
  
  let emailCount = 0;
  let totalValidEntries = 0;
  
  for (const row of sample) {
    const value = String(row[columnName] || "").trim();
    if (value) {
      totalValidEntries++;
      if (looksLikeEmail(value)) {
        emailCount++;
      }
    }
  }
  
  if (totalValidEntries === 0) return 0;
  
  // Retornar el porcentaje de emails válidos encontrados
  return emailCount / totalValidEntries;
}

// Función para encontrar el nombre de la columna de email
function findEmailColumnName(data: any[]): string {
  if (!data || data.length === 0) return "email";
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  // Primero: buscar columnas con nombres típicos de email
  const emailKeywords = [
    "email", "mail", "e-mail", "correo", "correo electronico", "correo electrónico",
    "e_mail", "email_address", "direccion de correo", "dirección de correo",
    "contacto", "contact", "administrador", "usuario", "user"
  ];
  
  for (const header of headers) {
    if (header && typeof header === "string") {
      const headerLower = header.toLowerCase();
      if (emailKeywords.some(keyword => headerLower.includes(keyword))) {
        // Verificar que realmente contenga emails
        const emailProbability = analyzeColumnForEmails(data, header);
        if (emailProbability > 0.3) { // Si más del 30% son emails válidos
          return header;
        }
      }
    }
  }
  
  // Segundo: analizar todas las columnas para encontrar la que más emails válidos tenga
  let bestColumn = headers[0] || "email";
  let bestScore = 0;
  
  for (const header of headers) {
    const emailProbability = analyzeColumnForEmails(data, header);
    if (emailProbability > bestScore) {
      bestScore = emailProbability;
      bestColumn = header;
    }
  }
  
  // Solo usar la columna si tiene al menos un 10% de emails válidos
  if (bestScore >= 0.1) {
    return bestColumn;
  }
  
  // Como último recurso, usar la primera columna
  return headers[0] || "email";
}

/**
 * Extrae emails de una columna de datos usando detección inteligente
 */
function extractEmailColumn(data: any[]): string[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const headers = Object.keys(firstRow);

  // Usar la misma lógica de detección inteligente
  const emailColumnName = findEmailColumnName(data);
  
  if (emailColumnName) {
    return data.map((row) => String(row[emailColumnName] || "")).filter((e) => e.trim() !== "");
  }

  return [];
}
