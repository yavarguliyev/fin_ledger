import type { RejectedImage } from '../profile/rejected-image.interface';

export interface UploadRequest {
  key: string;
  files: string[];
  rejected?: RejectedImage[];
}
