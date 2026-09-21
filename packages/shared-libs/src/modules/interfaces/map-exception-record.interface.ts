export interface MapExceptionRecord {
  readonly success: boolean;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
  };
  readonly correlationId: string;
}
