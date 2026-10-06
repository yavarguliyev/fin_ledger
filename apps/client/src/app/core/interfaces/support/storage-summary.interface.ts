import { StorageFile } from './storage-file.interface';

export interface StorageSummary {
  totalBytes: number;
  ownBytes: number;
  fileCount: number;
  customerTotalBytes?: number;
  files: StorageFile[];
}
