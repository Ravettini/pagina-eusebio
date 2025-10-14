"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ValidationParams } from "@/components/validation-params";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { processFileInFrontend } from "@/lib/file-processor";

interface ValidationResult {
  valid: Array<{ email: string }>;
  invalid: Array<{ email: string; motivo: string }>;
  totalProcessed: number;
  duplicatesRemoved: number;
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [params, setParams] = useState({
    allowRoleEmails: false,
    filterNonTargetTLDs: false,
    checkMX: false,
    checkAntiquity: false,
  });
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [emailColumnName, setEmailColumnName] = useState<string>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Procesar archivo en el frontend para evitar límites de Netlify
      console.log("Procesando archivo en el frontend...");
      const processingResult = await processFileInFrontend(file);
      
      console.log(`Archivo procesado: ${processingResult.processedRows} emails de ${processingResult.totalRows} filas`);
      
      // Enviar solo los emails extraídos al servidor
      const response = await fetch("/api/validate-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: processingResult.emails,
          params: params
        }),
      });

      if (!response.ok) {
        let errorMsg = "Error procesando el archivo";
        
        // Obtener el texto de la respuesta primero
        const responseText = await response.text();
        
        // Intentar parsearlo como JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.error || errorMsg;
        } catch {
          // Si no es JSON, usar el texto directo
          if (response.status === 413 || responseText.includes("too large")) {
            errorMsg = "El archivo es demasiado grande. Máximo: 10MB";
          } else if (responseText.includes("Internal Error") || response.status === 500) {
            errorMsg = "Error interno del servidor. Por favor, intentá de nuevo o probá con otro archivo.";
          } else {
            errorMsg = responseText.substring(0, 100) || errorMsg;
          }
        }
        throw new Error(errorMsg);
      }

          const data: ValidationResult = await response.json();
          setResult(data);
          setOriginalData(processingResult.originalData);
          setEmailColumnName(processingResult.emailColumnName);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleExportWithOriginalColumns = async (type: "valid" | "invalid" | "both", format: "xlsx" | "csv") => {
    if (!result || !originalData.length) return;

    try {
      console.log("Exportando con columnas originales...");
      
      // Crear un mapa de emails válidos e inválidos para marcar los datos originales
      const validEmails = new Set(result.valid.map(item => item.email));
      const invalidEmails = new Map(result.invalid.map(item => [item.email, item.motivo]));
      
      let dataToExport: any[] = [];
      let filename = "";

      if (type === "valid") {
        dataToExport = originalData.filter(row => {
          const email = row[emailColumnName];
          return email && validEmails.has(email);
        }).map(row => ({
          ...row,
          estado_validacion: "Válido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        filename = "emails_validos_columnas_originales";
      } else if (type === "invalid") {
        dataToExport = originalData.filter(row => {
          const email = row[emailColumnName];
          return email && invalidEmails.has(email);
        }).map(row => ({
          ...row,
          motivo_invalidez: invalidEmails.get(row[emailColumnName]),
          estado_validacion: "Inválido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        filename = "emails_invalidos_columnas_originales";
      } else {
        dataToExport = originalData.map(row => {
          const email = row[emailColumnName];
          if (email && validEmails.has(email)) {
            return {
              ...row,
              estado_validacion: "Válido",
              motivo_invalidez: "",
              fecha_validacion: new Date().toLocaleDateString("es-AR")
            };
          } else if (email && invalidEmails.has(email)) {
            return {
              ...row,
              estado_validacion: "Inválido",
              motivo_invalidez: invalidEmails.get(email),
              fecha_validacion: new Date().toLocaleDateString("es-AR")
            };
          }
          return null;
        }).filter(row => row !== null);
        filename = "resultado_completo_columnas_originales";
      }

      if (format === "csv") {
        const csvContent = exportToCSV(dataToExport);
        downloadFile(csvContent, `${filename}.csv`, "text/csv");
      } else {
        await exportToXLSX(dataToExport, `${filename}.xlsx`);
      }

    } catch (err: any) {
      alert(`Error exportando con columnas originales: ${err.message}`);
    }
  };

  const handleExport = async (type: "valid" | "invalid" | "both", format: "xlsx" | "csv") => {
    if (!result) return;

    try {
      // Exportar en el frontend para evitar límites de Netlify
      console.log("Exportando en el frontend...");
      
      let dataToExport: any[] = [];
      let filename = "";

      if (type === "valid") {
        dataToExport = result.valid.map(item => ({ 
          email: item.email,
          estado: "Válido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        filename = "emails_validos";
      } else if (type === "invalid") {
        dataToExport = result.invalid.map(item => ({ 
          email: item.email, 
          motivo: item.motivo,
          estado: "Inválido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        filename = "emails_invalidos";
      } else {
        dataToExport = [
          ...result.valid.map(item => ({ 
            email: item.email, 
            estado: "Válido",
            motivo: "",
            fecha_validacion: new Date().toLocaleDateString("es-AR")
          })),
          ...result.invalid.map(item => ({ 
            email: item.email, 
            estado: "Inválido", 
            motivo: item.motivo,
            fecha_validacion: new Date().toLocaleDateString("es-AR")
          }))
        ];
        filename = "resultado_validacion_completo";
      }

      if (format === "csv") {
        // Exportar CSV en el frontend
        const csvContent = exportToCSV(dataToExport);
        downloadFile(csvContent, `${filename}.csv`, "text/csv");
      } else {
        // Exportar XLSX en el frontend
        await exportToXLSX(dataToExport, `${filename}.xlsx`);
      }

    } catch (err: any) {
      alert(`Error exportando: ${err.message}`);
    }
  };

  const exportToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => headers.map(header => `"${row[header] || ""}"`).join(","))
    ];
    
    return csvRows.join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToXLSX = async (data: any[], filename: string) => {
    // Importar xlsx dinámicamente
    const XLSX = await import("xlsx");
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gcba-blue">Validador de Emails</h1>
            <p className="mt-2 text-lg text-gcba-gray">
              Cargá tu lista de correos electrónicos y obtené un análisis detallado de su
              validez
            </p>
            <p className="mt-1 text-sm text-gcba-cyan">
              Desarrollado por GO Observatorio y Datos
            </p>
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-3 p-4">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {!result && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
                {file && (
                  <Card className="mt-4">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button onClick={handleProcess} disabled={loading} size="lg">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Procesar lista"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div>
                <ValidationParams params={params} onChange={setParams} />
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de validación</CardTitle>
                  <CardDescription>
                    Se procesaron {result.totalProcessed} emails únicos
                    {result.duplicatesRemoved > 0 &&
                      ` (${result.duplicatesRemoved} duplicados eliminados)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg bg-gcba-cyan/20 p-4">
                      <CheckCircle2 className="h-8 w-8 text-gcba-blue" />
                      <div>
                        <p className="text-2xl font-bold text-gcba-blue">
                          {result.valid.length}
                        </p>
                        <p className="text-sm text-gcba-gray">Válidos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gcba-yellow/20 p-4">
                      <XCircle className="h-8 w-8 text-gcba-blue" />
                      <div>
                        <p className="text-2xl font-bold text-gcba-blue">
                          {result.invalid.length}
                        </p>
                        <p className="text-sm text-gcba-gray">Inválidos</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() => handleExport("both", "xlsx")}
                        variant="default"
                        size="lg"
                      >
                        Descargar todo (XLSX)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Tabs defaultValue="valid">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="valid">
                        Válidos ({result.valid.length})
                      </TabsTrigger>
                      <TabsTrigger value="invalid">
                        Inválidos ({result.invalid.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="valid">
                      <DataTable
                        type="valid"
                        data={result.valid}
                        onExport={(format) => handleExport("valid", format)}
                        onExportWithOriginalColumns={(format) => handleExportWithOriginalColumns("valid", format)}
                      />
                    </TabsContent>
                    <TabsContent value="invalid">
                      <DataTable
                        type="invalid"
                        data={result.invalid}
                        onExport={(format) => handleExport("invalid", format)}
                        onExportWithOriginalColumns={(format) => handleExportWithOriginalColumns("invalid", format)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setError(null);
                  }}
                >
                  Validar otra lista
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


