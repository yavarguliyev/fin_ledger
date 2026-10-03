export interface AccountEntriesDto {
  accountId: string;
  limit: number;
  before?: string;
  beforeId?: string;
}
