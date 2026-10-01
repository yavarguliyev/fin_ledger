export interface LimiterOptions {
  label: string;
  maxConcurrent?: number;
  queueLimit?: number;
}
