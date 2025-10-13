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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("params", JSON.stringify(params));

      // Usar endpoint diferente según el tamaño del archivo
      const endpoint = file.size > 6 * 1024 * 1024 ? "/api/validate-large" : "/api/validate";
      console.log("Usando endpoint:", endpoint, "para archivo de", file.size, "bytes");
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
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
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: "valid" | "invalid" | "both", format: "xlsx" | "csv") => {
    if (!result) return;

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valid: result.valid,
          invalid: result.invalid,
          format,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Error exportando el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const filename =
        type === "both"
          ? `resultado_validacion_${timestamp}.${format}`
          : type === "valid"
            ? `validos_${timestamp}.${format}`
            : `invalidos_${timestamp}.${format}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Error exportando: ${err.message}`);
    }
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
                      />
                    </TabsContent>
                    <TabsContent value="invalid">
                      <DataTable
                        type="invalid"
                        data={result.invalid}
                        onExport={(format) => handleExport("invalid", format)}
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


