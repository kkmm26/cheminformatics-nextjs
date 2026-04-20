import { useState, useCallback, useRef } from "react";
import { uploadFile } from "@/app/actions/upload-file";
import { UploadState } from "./types";
import { isValidFile } from "./utils";
import { toast } from "sonner";

export function useFileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => (s.status === "dragging" ? s : { status: "dragging" }));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setState((s) =>
      s.status === "idle" || s.status === "dragging" ? { status: "idle" } : s,
    );
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return setState({ status: "idle" });
    if (!isValidFile(file)) {
      return setState({
        status: "error",
        file: null,
        message: "Only .log files are supported.",
      });
    }
    setState({ status: "selected", file });
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidFile(file)) {
      return setState({
        status: "error",
        file: null,
        message: "Only .log files are supported.",
      });
    }
    setState({ status: "selected", file });
    e.target.value = "";
  }, []);

  const openFilePicker = useCallback(() => {
    if (state.status === "uploading") return;
    inputRef.current?.click();
  }, [state.status]);

  const handleUpload = useCallback(async () => {
    if (state.status !== "selected") return;
    const { file } = state;

    setState({ status: "uploading", file, progress: 10 });

    const progressTimer = setInterval(() => {
      setState((s) => {
        if (s.status !== "uploading") return s;
        const next = Math.min(
          s.progress + Math.floor(Math.random() * 15 + 5),
          85,
        );
        return { ...s, progress: next };
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // revalidatePath inside uploadMolecule will refresh the molecules list
      const result = await uploadFile(formData);

      clearInterval(progressTimer);

      if (!result.success) {
        setState({ status: "error", file, message: result.error });
        toast.error(result.error);
        return;
      }

      setState({ status: "uploading", file, progress: 100 });

      setState({ status: "success", file, fileName: result.fileName });
      toast.success(`Successfully uploaded ${result.fileName}`);
    } catch {
      clearInterval(progressTimer);
      setState({
        status: "error",
        file,
        message: "Something went wrong. Please try again.",
      });
      toast.error("Failed to upload file. Please try again.");
    }
  }, [state]);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return {
    state,
    inputRef,
    handlers: {
      onDragOver,
      onDragLeave,
      onDrop,
      onFileChange,
      openFilePicker,
      handleUpload,
      reset,
    },
  };
}
