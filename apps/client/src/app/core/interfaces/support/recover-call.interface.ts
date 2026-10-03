export interface RecoverCallDto {
  callId: string | null;
  onFailed: () => void;
}
