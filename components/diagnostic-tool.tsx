"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Search } from "lucide-react";
import * as XLSX from "xlsx";

interface DiagnosticResult {
  email: string;
  razon_bloqueo: string;
  categoria: string;
}

export function DiagnosticTool() {
  const [validList, setValidList] = useState<string[]>([]);
  const [importedList, setImportedList] = useState<string[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File, listType: "valid" | "imported") => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extraer emails (asumiendo que están en la primera columna)
        const emails = rawData.slice(1).map((row: any) => {
          if (Array.isArray(row) && row[0]) {
            return String(row[0]).toLowerCase().trim();
          }
          return "";
        }).filter(e => e && e.includes("@"));

        if (listType === "valid") {
          setValidList(emails);
        } else {
          setImportedList(emails);
        }
      } catch (error) {
        alert(`Error leyendo archivo: ${error}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const runDiagnostic = () => {
    if (validList.length === 0 || importedList.length === 0) {
      alert("Por favor, cargá ambas listas primero");
      return;
    }

    setLoading(true);

    // Crear set de emails importados para búsqueda rápida
    const importedSet = new Set(importedList);
    
    // Encontrar emails faltantes
    const missing = validList.filter(email => !importedSet.has(email));

    // Listas negras simuladas (rebotes previos conocidos)
    const blacklistedDomains = new Set([
      "example.com", "test.com", "fake.com", "invalid.com", 
      "noreply.com", "bounced.com"
    ]);

    const blacklistedUsers = new Set([
      "bounce", "bounced", "invalid", "error", "mailer-daemon"
    ]);

    // Palabras genéricas
    const genericKeywords = [
      "info", "contacto", "admin", "test", "prueba", "ejemplo", 
      "ventas", "soporte", "support", "help", "noreply", "no-reply"
    ];

    // Contar por dominio para detectar degradación
    const domainCounts: Map<string, { total: number; missing: number }> = new Map();
    
    validList.forEach(email => {
      const domain = email.split("@")[1];
      if (!domainCounts.has(domain)) {
        domainCounts.set(domain, { total: 0, missing: 0 });
      }
      domainCounts.get(domain)!.total++;
    });

    missing.forEach(email => {
      const domain = email.split("@")[1];
      if (domainCounts.has(domain)) {
        domainCounts.get(domain)!.missing++;
      }
    });

    // Diagnosticar cada email faltante
    const results: DiagnosticResult[] = missing.map(email => {
      const [localPart, domain] = email.split("@");
      
      // 1. Verificar rebote previo
      if (blacklistedDomains.has(domain) || blacklistedUsers.has(localPart.toLowerCase())) {
        return {
          email,
          razon_bloqueo: "Rebote previo",
          categoria: "técnico"
        };
      }

      // 2. Verificar correo genérico
      if (genericKeywords.some(keyword => localPart.toLowerCase().includes(keyword))) {
        return {
          email,
          razon_bloqueo: "Correo genérico o institucional bloqueado",
          categoria: "institucional"
        };
      }

      // 3. Verificar dominio degradado
      const domainStats = domainCounts.get(domain);
      if (domainStats && domainStats.missing / domainStats.total > 0.1) {
        return {
          email,
          razon_bloqueo: "Dominio degradado (>10% bloqueados)",
          categoria: "reputacional"
        };
      }

      // 4. Formato correcto pero depurado
      return {
        email,
        razon_bloqueo: "Formato correcto pero depurado por reputación",
        categoria: "reputacional"
      };
    });

    setDiagnosticResults(results);
    setLoading(false);
  };

  const exportResults = () => {
    if (diagnosticResults.length === 0) return;

    // Crear datos para exportar
    const dataToExport = diagnosticResults.map(r => ({
      email: r.email,
      razon_bloqueo: r.razon_bloqueo,
      categoria: r.categoria
    }));

    // Agregar estadísticas por dominio
    const domainStats: Map<string, Map<string, number>> = new Map();
    diagnosticResults.forEach(r => {
      const domain = r.email.split("@")[1];
      if (!domainStats.has(domain)) {
        domainStats.set(domain, new Map());
      }
      const reasons = domainStats.get(domain)!;
      reasons.set(r.razon_bloqueo, (reasons.get(r.razon_bloqueo) || 0) + 1);
    });

    const statsData = Array.from(domainStats.entries()).map(([domain, reasons]) => {
      const reasonsStr = Array.from(reasons.entries())
        .map(([reason, count]) => `${reason}: ${count}`)
        .join("; ");
      return {
        dominio: domain,
        total_bloqueados: Array.from(reasons.values()).reduce((a, b) => a + b, 0),
        razones: reasonsStr
      };
    });

    // Crear workbook con dos hojas
    const workbook = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(dataToExport);
    const ws2 = XLSX.utils.json_to_sheet(statsData);
    
    XLSX.utils.book_append_sheet(workbook, ws1, "Emails Bloqueados");
    XLSX.utils.book_append_sheet(workbook, ws2, "Estadísticas por Dominio");

    // Exportar
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostico_bloqueos_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gcba-cyan" />
            Herramienta de Diagnóstico Doppler
          </CardTitle>
          <CardDescription>
            Compará tu lista de emails válidos con la lista final importada en Doppler para identificar qué correos fueron bloqueados y por qué
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cargar archivos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lista de Emails Válidos</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".xlsx,.xls,.csv";
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, "valid");
                    };
                    input.click();
                  }}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Cargar Válidos
                </Button>
                {validList.length > 0 && (
                  <span className="text-sm text-green-600">
                    ✓ {validList.length} emails cargados
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lista Importada en Doppler</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".xlsx,.xls,.csv";
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, "imported");
                    };
                    input.click();
                  }}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Cargar Importados
                </Button>
                {importedList.length > 0 && (
                  <span className="text-sm text-green-600">
                    ✓ {importedList.length} emails cargados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botón de análisis */}
          <div className="flex items-center gap-4">
            <Button
              onClick={runDiagnostic}
              disabled={validList.length === 0 || importedList.length === 0 || loading}
              className="bg-gcba-cyan hover:bg-gcba-cyan/90 text-white"
            >
              {loading ? "Analizando..." : "Analizar Diferencias"}
            </Button>

            {diagnosticResults.length > 0 && (
              <Button
                onClick={exportResults}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Diagnóstico
              </Button>
            )}
          </div>

          {/* Resultados */}
          {diagnosticResults.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-semibold mb-2">Resumen</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Emails válidos:</span>
                    <span className="font-mono">{validList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emails importados:</span>
                    <span className="font-mono">{importedList.length}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Emails bloqueados:</span>
                    <span className="font-mono">{diagnosticResults.length}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Razón de Bloqueo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {diagnosticResults.slice(0, 100).map((result, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-mono">{result.email}</td>
                          <td className="px-4 py-3 text-sm">{result.razon_bloqueo}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              result.categoria === "técnico" ? "bg-red-100 text-red-800" :
                              result.categoria === "institucional" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {result.categoria}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {diagnosticResults.length > 100 && (
                  <div className="p-3 text-center text-sm text-muted-foreground border-t">
                    Mostrando 100 de {diagnosticResults.length} resultados. Exportá el archivo completo para ver todos.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

