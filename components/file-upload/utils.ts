/** Validates that the uploaded file extension is the expected Gaussian `.log`. */
export function isValidFile(file: File) {
  return file.name.endsWith(".log");
}

/** Formats raw byte size for upload UI display. */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
