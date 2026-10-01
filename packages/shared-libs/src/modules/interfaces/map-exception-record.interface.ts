export interface MapExceptionRecord {
  readonly success: boolean;
  readonly correlationId: string;

  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
  };
}
