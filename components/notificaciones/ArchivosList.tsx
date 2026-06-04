"use client";

import { useState } from "react";
import type { ArchivoAdjunto } from "@/lib/types";
import { Download, File } from "lucide-react";

export function ArchivosList({ archivos }: { archivos: ArchivoAdjunto[] }) {
  if (!archivos.length) {
    return (
      <p className="text-sm text-zeus-gray-text italic">Sin archivos adjuntos</p>
    );
  }

  return (
    <div className="space-y-2">
      {archivos.map((archivo) => (
        <a
          key={archivo.id}
          href={archivo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-zeus-border hover:border-zeus-navy-light hover:bg-blue-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-zeus-navy/10 flex items-center justify-center text-zeus-navy">
            <File size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{archivo.nombre}</p>
            <p className="text-xs text-zeus-gray-text">
              {(archivo.tamano / 1024).toFixed(1)} KB
            </p>
          </div>
          <Download
            size={16}
            className="text-zeus-gray-text group-hover:text-zeus-navy"
          />
        </a>
      ))}
    </div>
  );
}

export function FileInput({
  id,
  maxFiles,
  files,
  onChange,
  label,
}: {
  id: string;
  maxFiles: number;
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
}) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (incoming: File[]) => {
    const combined = [...files, ...incoming].slice(0, maxFiles);
    onChange(combined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      {label && <label className="zeus-label">{label}</label>}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-zeus-navy bg-blue-50"
            : "border-zeus-border hover:border-zeus-navy-light"
        } ${files.length >= maxFiles ? "opacity-60" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (files.length < maxFiles) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (files.length < maxFiles) {
            addFiles(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <input
          id={id}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={files.length >= maxFiles}
        />
        <label
          htmlFor={id}
          className={`cursor-pointer text-sm block ${
            files.length >= maxFiles
              ? "text-zeus-gray-text cursor-not-allowed"
              : "text-zeus-navy"
          }`}
        >
          {files.length >= maxFiles ? (
            `Máximo ${maxFiles} archivos alcanzado`
          ) : (
            <>
              <span className="font-medium">Arrastre archivos aquí</span>
              <span className="text-zeus-gray-text block mt-1">
                o haga clic para seleccionar ({files.length}/{maxFiles})
              </span>
            </>
          )}
        </label>
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-sm bg-slate-50 px-3 py-1.5 rounded"
            >
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-500 text-xs ml-2 hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
