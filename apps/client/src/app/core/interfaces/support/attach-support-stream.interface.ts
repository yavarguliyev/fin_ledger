import type { SupportStreamHandlerDto } from './support-stream-handler.interface';

export interface AttachSupportStreamDto extends SupportStreamHandlerDto {
  ticket: string;
}
