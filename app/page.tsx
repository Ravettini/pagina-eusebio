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

  const handleExportSplit = async (type: "valid" | "invalid", format: "xlsx" | "csv") => {
    if (!result) return;

    try {
      console.log("Exportando archivos divididos en lotes de 20,000...");
      
      const CHUNK_SIZE = 20000;
      let dataToSplit: any[] = [];
      let baseFilename = "";

      if (type === "valid") {
        dataToSplit = result.valid.map(item => ({ 
          email: item.email,
          estado: "Válido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        baseFilename = "emails_validos";
      } else {
        dataToSplit = result.invalid.map(item => ({ 
          email: item.email, 
          motivo: item.motivo,
          estado: "Inválido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        baseFilename = "emails_invalidos";
      }

      const totalChunks = Math.ceil(dataToSplit.length / CHUNK_SIZE);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunk = dataToSplit.slice(start, end);
        
        const filename = `${baseFilename}_parte_${i + 1}_de_${totalChunks}`;
        
        if (format === "csv") {
          const csvContent = exportToCSV(chunk);
          downloadFile(csvContent, `${filename}.csv`, "text/csv");
        } else {
          await exportToXLSX(chunk, `${filename}.xlsx`);
        }
        
        // Pequeña pausa entre descargas para no sobrecargar el navegador
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      alert(`Se descargaron ${totalChunks} archivos con éxito`);

    } catch (err: any) {
      alert(`Error exportando archivos divididos: ${err.message}`);
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

      // Usar un Set para trackear emails ya exportados (evitar duplicados)
      const exportedEmails = new Set<string>();

      if (type === "valid") {
        dataToExport = originalData.filter(row => {
          const email = row[emailColumnName];
          if (email && validEmails.has(email) && !exportedEmails.has(email)) {
            exportedEmails.add(email);
            return true;
          }
          return false;
        }).map(row => ({
          ...row,
          estado_validacion: "Válido",
          fecha_validacion: new Date().toLocaleDateString("es-AR")
        }));
        filename = "emails_validos_columnas_originales";
      } else if (type === "invalid") {
        dataToExport = originalData.filter(row => {
          const email = row[emailColumnName];
          if (email && invalidEmails.has(email) && !exportedEmails.has(email)) {
            exportedEmails.add(email);
            return true;
          }
          return false;
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
          if (email && validEmails.has(email) && !exportedEmails.has(email)) {
            exportedEmails.add(email);
            return {
              ...row,
              estado_validacion: "Válido",
              motivo_invalidez: "",
              fecha_validacion: new Date().toLocaleDateString("es-AR")
            };
          } else if (email && invalidEmails.has(email) && !exportedEmails.has(email)) {
            exportedEmails.add(email);
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
    <div className="flex min-h-screen flex-col bg-[#131313] text-white">
      <Header />

      <main className="flex-1 pt-20 md:pt-24">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-10 text-center md:px-8 md:pt-10">
          <h1 className="font-bold tracking-tight text-4xl md:text-6xl">
            Validá tu base de emails{" "}
            <span className="bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] bg-clip-text text-transparent">
              en minutos
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white">
            Detectá correos inválidos, filtrá direcciones no deseadas y prepará listas más
            limpias para tus campañas institucionales.
          </p>
          <p className="mt-2 text-sm text-[#7bd0ff]">
            Desarrollado por Ignacio Ravettini Novellino
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] px-8 text-base font-semibold text-white shadow-lg hover:brightness-110"
              onClick={() => {
                const el = document.getElementById("validator-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Comenzar ahora
            </Button>
            <Badge className="rounded-full bg-[#201f1f] px-4 py-2 text-xs font-medium text-white">
              100% procesamiento en el navegador · sin subir tus datos
            </Badge>
          </div>
        </section>

        {/* Zona principal: dropzone + parámetros / resultados */}
        <section
          id="validator-section"
          className="mx-auto mb-16 max-w-7xl px-4 md:px-8"
        >
          {error && (
            <Card className="mb-6 border-red-500/60 bg-[#201f1f] text-red-300">
              <CardContent className="flex items-center gap-3 p-4">
                <XCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {!result && (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Izquierda: dropzone estilo Stitch */}
              <div className="lg:col-span-7">
                <Card className="relative overflow-hidden border-0 bg-[#1c1b1b]">
                  <CardContent className="p-6 sm:p-8">
                    <div className="rounded-2xl border border-dashed border-[#2563eb] bg-[#131313] px-4 py-10 sm:px-8">
                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563eb]/15 text-[#2563eb]">
                          <Loader2 className="h-8 w-8" />
                        </div>
                        <div className="max-w-md">
                          <h2 className="text-xl font-semibold text-white">
                            Seleccionar archivo
                          </h2>
                          <p className="mt-1 text-sm text-white">
                            Arrastrá tu archivo CSV o Excel, o usá el selector clásico.
                          </p>
                          <p className="mt-2 text-xs font-mono uppercase tracking-wider text-white">
                            Formatos soportados: .CSV, .XLSX · Máx 10MB
                          </p>
                        </div>
                        <div className="mt-4 w-full max-w-xl">
                          <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
                        </div>
                      </div>

                      {file && (
                        <Card className="mt-6 border-0 bg-[#201f1f]">
                          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-left">
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-white">
                                {(file.size / 1024).toFixed(2)} KB · listo para validar
                              </p>
                            </div>
                            <Button
                              onClick={handleProcess}
                              disabled={loading}
                              size="lg"
                              className="w-full rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] sm:w-auto"
                            >
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
                  </CardContent>
                </Card>
              </div>

              {/* Derecha: parámetros de validación estilo panel oscuro */}
              <div className="lg:col-span-5">
                <Card className="border-0 bg-[#201f1f] text-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/15 text-[#7bd0ff]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Parámetros de validación
                        </CardTitle>
                        <CardDescription className="text-xs text-white">
                          Ajustá las reglas según tu estrategia de envíos y tu segmentación.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ValidationParams params={params} onChange={setParams} />
                    <p className="mt-4 text-[11px] leading-relaxed text-white">
                      Tip: usar filtros más estrictos mejora la entregabilidad pero puede
                      reducir la cantidad de emails válidos. Probá distintas combinaciones
                      según la criticidad de tu campaña.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              {/* Resumen tipo tarjetas métricas */}
              <Card className="border-0 bg-[#201f1f] text-white">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Resumen de validación
                      </CardTitle>
                      <CardDescription className="text-sm text-white">
                        Se procesaron {result.totalProcessed} emails únicos
                        {result.duplicatesRemoved > 0 &&
                          ` (${result.duplicatesRemoved} duplicados eliminados)`}
                      </CardDescription>
                    </div>
                    <Badge className="w-fit rounded-full bg-[#2563eb]/15 px-4 py-1 text-[11px] font-medium text-[#b4c5ff]">
                      Ejemplo en vivo · datos de tu archivo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-[#201f1f] p-5 ring-1 ring-green-500/60">
                      <p className="text-xs font-medium text-white">Válidos</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-3xl font-bold text-white">
                          {result.valid.length}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#201f1f] p-5 ring-1 ring-red-500/60">
                      <p className="text-xs font-medium text-white">Inválidos</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-3xl font-bold text-white">
                          {result.invalid.length}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#201f1f] p-5 ring-1 ring-yellow-500/60">
                      <p className="text-xs font-medium text-white">Duplicados</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-3xl font-bold text-white">
                          {result.duplicatesRemoved}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between rounded-lg bg-[#201f1f] p-5 ring-1 ring-[#2563eb]/60">
                      <p className="text-xs font-medium text-white">
                        Acciones rápidas
                      </p>
                      <Button
                        onClick={() => handleExport("both", "xlsx")}
                        size="lg"
                        className="mt-3 w-full rounded-full bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                      >
                        Descargar todo (XLSX)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla de resultados con tabs, estilo panel oscuro */}
              <Card className="border-0 bg-[#201f1f]">
                <CardContent className="pt-6">
                  <Tabs defaultValue="valid">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#131313]">
                      <TabsTrigger value="valid" className="data-[state=active]:bg-[#2563eb]">
                        Válidos ({result.valid.length})
                      </TabsTrigger>
                      <TabsTrigger value="invalid" className="data-[state=active]:bg-[#2563eb]">
                        Inválidos ({result.invalid.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="valid">
                      <DataTable
                        type="valid"
                        data={result.valid}
                        onExport={(format) => handleExport("valid", format)}
                        onExportWithOriginalColumns={(format) =>
                          handleExportWithOriginalColumns("valid", format)
                        }
                        onExportSplit={(format) => handleExportSplit("valid", format)}
                      />
                    </TabsContent>
                    <TabsContent value="invalid">
                      <DataTable
                        type="invalid"
                        data={result.invalid}
                        onExport={(format) => handleExport("invalid", format)}
                        onExportWithOriginalColumns={(format) =>
                          handleExportWithOriginalColumns("invalid", format)
                        }
                        onExportSplit={(format) => handleExportSplit("invalid", format)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-full border-[#434655] bg-[#131313] text-sm text-[#e5e2e1] hover:bg-[#201f1f]"
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
        </section>

        {/* Sección de features y pasos, inspirada en Stitch */}
        <section className="border-t border-[#434655]/40 bg-[#1c1b1b] py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#201f1f] text-[#b4c5ff]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold">Detecta inválidos</h3>
                <p className="mt-2 text-sm text-white">
                  Algoritmos que identifican dominios inexistentes y correos mal formados.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#201f1f] text-[#7bd0ff]">
                  <XCircle className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold">Reduce rebotes</h3>
                <p className="mt-2 text-sm text-white">
                  Protegé la reputación de los dominios oficiales evitando campañas con listas
                  sucias.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#201f1f] text-[#ffb596]">
                  <Loader2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold">Mejora entregabilidad</h3>
                <p className="mt-2 text-sm text-white">
                  Asegurate de que los mensajes lleguen a casillas reales y activas.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-center text-2xl font-semibold">Cómo funciona</h2>
              <div className="mt-10 grid gap-8 md:grid-cols-4">
                {["Subir", "Configurar", "Procesar", "Descargar"].map((step, index) => (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center text-sm text-white"
                    >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-sm font-bold text-white ring-4 ring-[#131313]">
                      {index + 1}
                    </div>
                    <p className="font-semibold text-[#e5e2e1]">{step}</p>
                    <p className="mt-1 text-xs">
                      {index === 0 &&
                        "Cargá tu base en formatos estándar (CSV/XLSX)."}
                      {index === 1 &&
                        "Definí reglas según región, dominios o criticidad de la campaña."}
                      {index === 2 && "Validamos cada registro en el navegador."}
                      {index === 3 &&
                        "Descargá tu lista limpia y segmentada para usarla donde quieras."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


