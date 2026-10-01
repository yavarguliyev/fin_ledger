export interface PasskeySummary {
  id: string;
  deviceLabel: string | null;
  backedUp: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}
