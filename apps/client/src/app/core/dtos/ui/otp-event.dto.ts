export interface OtpEventDto<T extends Event = Event> {
  index: number;
  event: T;
}
