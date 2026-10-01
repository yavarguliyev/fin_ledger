import type { SupportStreamHandlerDto } from './support-stream-handler.dto';

export interface AttachSupportStreamDto extends SupportStreamHandlerDto {
  ticket: string;
}
