"use client";

import { useState, useCallback } from "react";
import { Upload } from "lucide-react";
// import { useMolecules } from "@/lib/molecule-context";
// import { parseGaussianLog, validateLogFile } from "@/lib/gaussian-parser";

export function FileUpload() {
  const { addMolecule } = useMolecules();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".log")) {
        alert("Please upload a .log file");
        return;
      }

      setIsProcessing(true);
      try {
        const content = await file.text();

        if (!validateLogFile(content)) {
          alert("This does not appear to be a valid Gaussian log file");
          return;
        }

        const molecule = parseGaussianLog(content, file.name);
        if (molecule) {
          addMolecule(molecule);
        } else {
          alert("Could not parse the log file");
        }
      } catch (error) {
        console.error("[v0] Error processing file:", error);
        alert("Error processing file");
      } finally {
        setIsProcessing(false);
      }
    },
    [addMolecule],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);
      e.target.value = "";
    },
    [processFile],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }
        ${isProcessing ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input
        type="file"
        accept=".log"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={`
          flex items-center justify-center w-12 h-12 rounded-full transition-colors
          ${isDragOver ? "bg-primary/10" : "bg-muted"}
        `}
        >
          <Upload
            className={`w-6 h-6 ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isProcessing
              ? "Processing..."
              : "Drag and drop Gaussian .log file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <span className="text-primary underline underline-offset-2">
              click to browse files
            </span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Supported format: .log</p>
      </div>
    </div>
  );
}
