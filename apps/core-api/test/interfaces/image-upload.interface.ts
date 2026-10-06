export interface ImagePart {
  content: Buffer;
  name: string;
  type: string;
}

export interface ImageUpload {
  parts: ImagePart[];
  token: string;
}

export interface ImageParts {
  parts: ImagePart[];
}

export interface ImageBatchResult {
  status: number;
  body: Record<string, unknown>;
}
