export interface RefreshRecord {
  readonly userId: string;
  readonly used: boolean;
  readonly replacedBy?: string;
  readonly usedAt?: number;
}
