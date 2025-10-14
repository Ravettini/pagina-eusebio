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

// Función para encontrar el nombre de la columna de email
function findEmailColumnName(data: any[]): string {
  if (!data || data.length === 0) return "email";
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  // Buscar columnas que contengan "email" o "correo"
  const emailKeywords = ["email", "correo", "e-mail", "mail"];
  
  for (const header of headers) {
    if (header && typeof header === "string") {
      const headerLower = header.toLowerCase();
      if (emailKeywords.some(keyword => headerLower.includes(keyword))) {
        return header;
      }
    }
  }
  
  // Si no encuentra ninguna, usar la primera columna o "email"
  return headers[0] || "email";
}

/**
 * Extrae emails de una columna de datos
 */
function extractEmailColumn(data: any[]): string[] {
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
