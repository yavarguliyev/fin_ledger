export interface AdminUserPageRow {
  id: string;
  created_at: string;
}

export interface AdminUserPageQuery {
  query: Record<string, string>;
}

export interface AdminUserPageCursor {
  row: AdminUserPageRow | undefined;
}

export interface AdminStatsBody {
  stats: { totalUsers: number; activeWallets: number };
}

export interface PlayerIdRow {
  id: string;
}

export interface PlayerCountRow {
  total: number;
  active: number;
}
