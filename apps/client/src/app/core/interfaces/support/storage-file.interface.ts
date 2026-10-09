export interface StorageFile {
  messageId: string;
  kind: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
  mine: boolean;
  url: string;
}
