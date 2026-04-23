"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "./use-file-upload";
import { DropZoneIdle, FilePreview, UploadProgress } from "./sub-components";
import { Input } from "../ui/input";

export function FileUpload() {
  const { state, inputRef, handlers } = useFileUpload();

  const isDragging = state.status === "dragging";
  const isUploading = state.status === "uploading";
  const isClickable = state.status !== "uploading";

  return (
    <div className="w-full space-y-3">
      <div
        role="button"
        tabIndex={isClickable ? 0 : -1}
        aria-label="Upload Gaussian log file"
        onClick={handlers.openFilePicker}
        onKeyDown={(e) => e.key === "Enter" && handlers.openFilePicker()}
        onDragOver={handlers.onDragOver}
        onDragLeave={handlers.onDragLeave}
        onDrop={handlers.onDrop}
        className={cn(
          "relative flex min-h-25 max-h-25 items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-2 text-center transition-all duration-200",
          "bg-muted/30",
          isClickable &&
            "cursor-pointer hover:bg-muted/50 hover:border-primary/40",
          isDragging && "border-primary bg-primary/5 scale-[1.01]",
          !isDragging && "border-border",
          isUploading && "cursor-default pointer-events-none",
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".log"
          className="sr-only"
          onChange={handlers.onFileChange}
          aria-hidden="true"
        />

        {(state.status === "idle" || state.status === "dragging") && (
          <DropZoneIdle dragging={isDragging} />
        )}

        {state.status === "selected" && (
          <FilePreview file={state.file} onClear={handlers.reset} />
        )}

        {state.status === "uploading" && (
          <div className="w-full space-y-3">
            <FilePreview file={state.file} uploading />
            <UploadProgress progress={state.progress} />
          </div>
        )}

        {state.status === "success" && (
          <div className="flex flex-col items-center gap-2 py-1">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload complete</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{state.fileName}</span> added to
                your library
              </p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-2 py-1">
            <XCircle className="h-7 w-7 text-destructive" />
            <div className="text-center">
              <p className="text-sm font-medium text-destructive">
                Upload failed
              </p>
              <p className="text-xs text-muted-foreground">{state.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex min-h-5 max-h-5 justify-end gap-2">
        {(state.status === "success" || state.status === "error") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handlers.reset();
              handlers.openFilePicker();
            }}
          >
            Upload another
          </Button>
        )}
        {state.status === "selected" && (
          <>
            <Button variant="ghost" size="sm" onClick={handlers.reset}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlers.handleUpload}>
              Upload
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
