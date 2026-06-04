"use client";

export type ExportColumn = {
  header: string;
  key: string;
  width?: number;
};

export type ExportRow = Record<string, string | number>;

export function rowsFromNotificaciones(
  items: ExportRow[]
): ExportRow[] {
  return items;
}

export async function exportToExcel(
  filename: string,
  sheetName: string,
  columns: ExportColumn[],
  rows: ExportRow[]
) {
  const XLSX = await import("xlsx");
  const headers = columns.map((c) => c.header);
  const data = rows.map((row) =>
    columns.map((c) => row[c.key] ?? "")
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws["!cols"] = columns.map((c) => ({ wch: c.width ?? 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPdf(
  title: string,
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  meta?: string
) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("ZEUS — Sistema de Notificaciones RRHH", 14, 12);
  doc.setFontSize(10);
  doc.text(title, 14, 20);
  if (meta) {
    doc.setFontSize(8);
    doc.text(meta, 14, 25);
  }

  doc.setTextColor(30, 41, 59);
  autoTable(doc, {
    startY: 34,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generado: ${new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date())} · Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

export async function exportExpedientePdf(
  expediente: string,
  sections: { titulo: string; lineas: string[] }[]
) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;

  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Expediente completo", 14, 15);
  doc.setFontSize(12);
  doc.text(expediente, 14, 26);

  doc.setTextColor(30, 41, 59);
  y = 45;

  for (const section of sections) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.titulo, 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const line of section.lineas) {
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
    y += 6;
  }

  doc.save(`${expediente}-expediente.pdf`);
}

export function notificacionToExportRow(
  n: {
    numeroExpediente: string;
    numeroIncidencia?: string;
    fechaHora: string;
    colaboradorNombre: string;
    areaEmision: string;
    tipoNotificacion: string;
    estado: string;
    prioridad?: string;
    areaRecepcion?: string;
    derivadoPorNombre?: string;
    asignadoANombre?: string;
  },
  extra?: Record<string, string>
): ExportRow {
  return {
    expediente: n.numeroExpediente,
    incidencia: n.numeroIncidencia || "—",
    fecha: new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(n.fechaHora)),
    colaborador: n.colaboradorNombre,
    area: n.areaEmision,
    tipo: n.tipoNotificacion,
    estado: n.estado,
    prioridad: n.prioridad || "—",
    areaRecepcion: n.areaRecepcion || "—",
    responsable: n.derivadoPorNombre || n.asignadoANombre || "—",
    ...extra,
  };
}

export const COLUMNAS_COLABORADOR: ExportColumn[] = [
  { header: "Expediente", key: "expediente", width: 12 },
  { header: "Incidencia", key: "incidencia", width: 14 },
  { header: "Fecha", key: "fecha", width: 18 },
  { header: "Área", key: "area", width: 14 },
  { header: "Tipo", key: "tipo", width: 22 },
  { header: "Estado", key: "estado", width: 14 },
  { header: "Prioridad", key: "prioridad", width: 10 },
];

export const COLUMNAS_RH: ExportColumn[] = [
  { header: "Expediente", key: "expediente", width: 12 },
  { header: "Incidencia", key: "incidencia", width: 14 },
  { header: "Fecha", key: "fecha", width: 18 },
  { header: "Colaborador", key: "colaborador", width: 20 },
  { header: "Área", key: "area", width: 14 },
  { header: "Área Recep.", key: "areaRecepcion", width: 14 },
  { header: "Tipo", key: "tipo", width: 18 },
  { header: "Estado", key: "estado", width: 12 },
  { header: "Prioridad", key: "prioridad", width: 10 },
  { header: "Asignado", key: "responsable", width: 18 },
];

export const COLUMNAS_DERIVADAS: ExportColumn[] = [
  { header: "Expediente", key: "expediente", width: 12 },
  { header: "Incidencia", key: "incidencia", width: 14 },
  { header: "Fecha", key: "fecha", width: 18 },
  { header: "Colaborador", key: "colaborador", width: 20 },
  { header: "Área", key: "area", width: 14 },
  { header: "Estado", key: "estado", width: 12 },
  { header: "Prioridad", key: "prioridad", width: 10 },
  { header: "Derivado por", key: "responsable", width: 20 },
];
