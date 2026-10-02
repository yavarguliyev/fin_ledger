import type { SupportStreamEvent } from './support-stream-event.interface';

export interface SupportStreamHandlerDto {
  onMessage: (event: SupportStreamEvent) => void;
}
