import { UploadCloud, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "./utils";

export function DropZoneIdle({ dragging }: { dragging: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 pointer-events-none">
      <div
        className={cn(
          "rounded-full p-4 transition-colors duration-200",
          dragging
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <UploadCloud className="h-7 w-7" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">
          {dragging ? "Drop your file here" : "Drag & drop a Gaussian log file"}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse &mdash; <span className="font-mono">.log</span>{" "}
          files only
        </p>
      </div>
    </div>
  );
}

export function FilePreview({
  file,
  onClear,
  uploading,
}: {
  file: File;
  onClear?: () => void;
  uploading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 w-full px-1">
      <div className="rounded-md bg-muted p-2 shrink-0">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </p>
      </div>
      {!uploading && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="shrink-0 rounded-full p-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full space-y-1.5 px-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Parsing and uploading…
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
