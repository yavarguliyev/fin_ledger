export interface JobRow {
  id: string;
  name: string;
  attempts: number;
  maxAttempts: number;
}

export interface JobEnqueue {
  dedupeKey?: string;
}

export interface JobRef {
  jobId: string;
}

export interface JobStatus {
  status: string;
  attempts: number;
}
