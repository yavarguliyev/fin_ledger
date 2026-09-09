export const errorResponse = (error: unknown): { message: string; stack?: string | undefined } => {
  if (error instanceof Error) return { message: error.message, stack: error?.stack ?? undefined };
  if (typeof error === 'string') return { message: error };
  if (error && typeof error === 'object' && 'message' in error) return { message: String(error.message) };

  return { message: 'Internal error' };
};
