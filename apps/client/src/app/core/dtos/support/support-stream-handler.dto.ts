import type { SupportStreamEvent } from '../../interfaces/support/support-stream-event.interface';

export interface SupportStreamHandlerDto {
  onMessage: (event: SupportStreamEvent) => void;
}
