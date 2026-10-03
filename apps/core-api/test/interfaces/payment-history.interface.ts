export interface HistoryRow {
  from_status: string | null;
  to_status: string;
  source: string;
}

export interface HistoryIdRow {
  id: string;
}

export interface HistoryTransactionRow {
  id: string;
  status: string;
}

export interface HistoryWebhookDto {
  type: string;
}
