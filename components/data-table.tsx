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
  onExportWithOriginalColumns?: (format: "xlsx" | "csv") => void;
  onExportSplit?: (format: "xlsx" | "csv") => void;
}

export function DataTable({ type, data, onExport, onExportWithOriginalColumns, onExportSplit }: DataTableProps) {
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
          <Input
            placeholder="Buscar email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-[#131313] text-white placeholder:text-white/60 border-[#434655]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="border-[#434655] bg-[#131313] text-white hover:bg-[#201f1f]"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("csv")}
            className="border-[#434655] bg-[#131313] text-white hover:bg-[#201f1f]"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("xlsx")}
            className="border-[#434655] bg-[#131313] text-white hover:bg-[#201f1f]"
          >
            <Download className="mr-2 h-4 w-4" />
            XLSX
          </Button>
          {onExportWithOriginalColumns && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportWithOriginalColumns("csv")}
                className="border-[#434655] bg-[#131313] text-white hover:bg-[#201f1f]"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV Original
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportWithOriginalColumns("xlsx")}
                className="border-[#434655] bg-[#131313] text-white hover:bg-[#201f1f]"
              >
                <Download className="mr-2 h-4 w-4" />
                XLSX Original
              </Button>
            </>
          )}
          {onExportSplit && data.length > 20000 && (
            <>
              <Button variant="default" size="sm" onClick={() => onExportSplit("csv")}>
                <Download className="mr-2 h-4 w-4" />
                CSV Dividido (20k)
              </Button>
              <Button variant="default" size="sm" onClick={() => onExportSplit("xlsx")}>
                <Download className="mr-2 h-4 w-4" />
                XLSX Dividido (20k)
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#434655] bg-[#131313]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#201f1f]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-white">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white">
                  Email
                </th>
                {type === "invalid" && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">
                    Motivo
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353534]">
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={type === "invalid" ? 3 : 2}
                    className="px-4 py-8 text-center text-white"
                  >
                    <p className="text-sm">
                      {searchTerm ? "No se encontraron resultados" : "No hay datos"}
                    </p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={startIndex + index} className="hover:bg-[#201f1f]">
                    <td className="px-4 py-3 text-sm text-white">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-white">
                      {item.email}
                    </td>
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
          <p className="text-sm text-white">
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




