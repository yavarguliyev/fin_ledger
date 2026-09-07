import { DownloadUrlOptions } from '../../interfaces/storage.interface';

export abstract class BaseStrategy {
  abstract upload(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void>;
  abstract getDownloadUrl(key: string, options?: DownloadUrlOptions): Promise<string>;
  abstract delete(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract listByPrefix(prefix: string): Promise<string[]>;
  abstract getTotalUsage(): Promise<number>;
}
