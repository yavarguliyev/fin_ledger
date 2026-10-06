export interface WalletOverviewBody {
  summary: unknown[];
  recent: { data: unknown[]; total: number };
}

export interface WalletIdRow {
  id: string;
}

export interface WalletPathQuery {
  walletId: string;
  suffix: string;
}

export interface WalletEmailQuery {
  email: string;
}
