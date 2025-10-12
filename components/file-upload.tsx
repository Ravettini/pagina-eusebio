"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      alert("Por favor, seleccioná un archivo .xlsx o .csv");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo es 10MB");
      return false;
    }

    return true;
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card className={dragActive ? "border-gcba-blue bg-gcba-cyan/10" : ""}>
      <CardContent className="p-8">
        <div
          className="flex flex-col items-center justify-center gap-4"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="rounded-full bg-gcba-cyan/20 p-6">
            <Upload className="h-12 w-12 text-gcba-blue" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gcba-blue">
              Arrastrá y soltá tu archivo
            </p>
            <p className="text-sm text-gcba-gray">o hacé clic para seleccionarlo</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Archivos aceptados: .xlsx, .csv (máximo 10MB)
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            disabled={disabled}
          />
          <Button
            onClick={onButtonClick}
            disabled={disabled}
            variant="default"
            size="lg"
            className="mt-2"
          >
            Seleccionar archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}




