/**
 * Procesador de archivos en el frontend para evitar límites de Netlify
 */

import * as XLSX from "xlsx";

export interface FileProcessingResult {
  emails: string[];
  totalRows: number;
  processedRows: number;
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

        // Extraer emails
        const emails = extractEmailColumn(rawData);
        
        // Limitar a 1000 emails para evitar problemas de rendimiento
        const limitedEmails = emails.slice(0, 1000);

        resolve({
          emails: limitedEmails,
          totalRows: rawData.length,
          processedRows: limitedEmails.length
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
