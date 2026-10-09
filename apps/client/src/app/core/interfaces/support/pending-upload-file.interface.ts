export interface PendingUploadFile {
  name: string;
  kind: string;
  sizeBytes: number;
  objectUrl: string | null;
}
