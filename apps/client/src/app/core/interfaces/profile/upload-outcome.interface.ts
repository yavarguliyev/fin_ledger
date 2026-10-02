import type { RejectedImage } from './rejected-image.interface';

export interface UploadOutcomeDto {
  uploaded: number;
  rejected: RejectedImage[];
}
