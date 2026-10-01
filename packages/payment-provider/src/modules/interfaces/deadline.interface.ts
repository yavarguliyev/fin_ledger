export interface Deadline<T> {
  deadlineMs: number;
  label: string;

  operation: () => Promise<T>;
}
