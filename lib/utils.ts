export function formatFechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatFechaHoraLarga(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

export async function uploadFiles(files: File[]): Promise<
  { id: string; nombre: string; url: string; tamano: number; tipo: string }[]
> {
  if (!files.length) return [];
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Error al subir archivos");
  const data = await res.json();
  return data.archivos;
}
