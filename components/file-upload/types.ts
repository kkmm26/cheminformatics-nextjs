export type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "selected"; file: File }
  | { status: "uploading"; file: File; progress: number }
  | { status: "success"; file: File; fileName: string }
  | { status: "error"; file: File | null; message: string };
