"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps {
  type: "valid" | "invalid";
  data: Array<{ email: string; motivo?: string }>;
  onExport: (format: "xlsx" | "csv") => void;
}

export function DataTable({ type, data, onExport }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercaseSearch = searchTerm.toLowerCase();
    return data.filter((item) => item.email.toLowerCase().includes(lowercaseSearch));
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const copyToClipboard = async () => {
    const text = filteredData.map((item) => item.email).join("\n");
    await navigator.clipboard.writeText(text);
    alert("Emails copiados al portapapeles");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("xlsx")}>
            <Download className="mr-2 h-4 w-4" />
            XLSX
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                {type === "invalid" && (
                  <th className="px-4 py-3 text-left text-sm font-medium">Motivo</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={type === "invalid" ? 3 : 2} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "No se encontraron resultados" : "No hay datos"}
                    </p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={startIndex + index} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{item.email}</td>
                    {type === "invalid" && (
                      <td className="px-4 py-3">
                        <Badge variant="warning" className="text-xs">
                          {item.motivo}
                        </Badge>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de{" "}
            {filteredData.length} resultados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}




