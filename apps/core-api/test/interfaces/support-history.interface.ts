export interface ClearedBody {
  cleared: number;
}

export interface DeletedBody {
  deleted: number;
  failed: number;
}

export interface HistoryRequestDto {
  token: string;
  path: string;
  body: Record<string, unknown>;
}
