export interface RawEmailEvent {
  to: string;
  subject: string;
  url?: string;
  sealedUrl?: string;
}
