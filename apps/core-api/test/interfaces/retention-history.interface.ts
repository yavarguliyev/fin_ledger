export interface IdRow {
  id: string;
}

export interface PrivilegeRow {
  allowed: boolean;
}

export interface SeedNotification {
  status: string;
  ageDays: number;
}

export interface SeedLogin {
  ageDays: number;
}
