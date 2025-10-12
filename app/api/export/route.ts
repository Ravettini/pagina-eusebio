import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

interface ExportData {
  valid: Array<{ email: string }>;
  invalid: Array<{ email: string; motivo: string }>;
  format: "xlsx" | "csv";
  type: "valid" | "invalid" | "both";
}

export async function POST(req: NextRequest) {
  try {
    const body: ExportData = await req.json();
    const { valid, invalid, format, type } = body;

    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");

    if (format === "xlsx") {
      const workbook = XLSX.utils.book_new();

      if (type === "both" || type === "valid") {
        const validSheet = XLSX.utils.json_to_sheet(
          valid.map((v) => ({ Email: v.email }))
        );
        XLSX.utils.book_append_sheet(workbook, validSheet, "VALIDOS");
      }

      if (type === "both" || type === "invalid") {
        const invalidSheet = XLSX.utils.json_to_sheet(
          invalid.map((i) => ({ Email: i.email, Motivo: i.motivo }))
        );
        XLSX.utils.book_append_sheet(workbook, invalidSheet, "INVALIDOS");
      }

      // Generar buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      const filename =
        type === "both"
          ? `resultado_validacion_${timestamp}.xlsx`
          : type === "valid"
            ? `validos_${timestamp}.xlsx`
            : `invalidos_${timestamp}.xlsx`;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // CSV
      let csvContent = "";

      if (type === "valid") {
        csvContent = "Email\n";
        csvContent += valid.map((v) => v.email).join("\n");
      } else if (type === "invalid") {
        csvContent = "Email,Motivo\n";
        csvContent += invalid.map((i) => `"${i.email}","${i.motivo}"`).join("\n");
      } else {
        // both: retornar válidos por defecto
        csvContent = "Email\n";
        csvContent += valid.map((v) => v.email).join("\n");
      }

      const filename =
        type === "invalid" ? `invalidos_${timestamp}.csv` : `validos_${timestamp}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Error exportando archivo:", error);
    return NextResponse.json(
      { error: `Error exportando el archivo: ${error.message}` },
      { status: 500 }
    );
  }
}




