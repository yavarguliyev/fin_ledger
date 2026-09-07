import { Email, Id, Roles, DisplayName, CreatedAt, Message, Success } from './base.mode';

export interface AdminStats {
  totalUsers: number;
  activeWallets: number;
  totalVolumeMinor: number;
  pending: number;
}

export interface UserWithWallet extends Id, Email, DisplayName, CreatedAt {
  role: string;
  walletId: string | null;
  isEmailVerified: boolean;
  deletedAt: string | null;
  currency: string | null;
  status: string | null;
  availableBalanceMinor: number | null;
  reservedBalanceMinor: number | null;
}

export interface AdminDashboard {
  stats: AdminStats;
  users: UserWithWallet[];
}

export interface AdminUser extends Id, Email, Roles {
  name: string;
  status: string;
  balance: number;
  currency: string;
  walletId: string | null;
  isEmailVerified: boolean;
  deletedAt: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeWallets: number;
  totalVolumeMinor: number;
  pending: number;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface UserData {
  displayName: string;
  email: string;
  role: string;
}

export interface BackendUserWithWallet extends Id, Email {
  role: string;
  display_name: string;
  wallet_id: string | null;
  is_email_verified: boolean;
  deleted_at: string | null;
  created_at: string;
  available_balance_minor: number | null;
  reserved_balance_minor: number | null;
  currency: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | null;
}

export interface BackendAdminDashboard {
  stats: {
    totalUsers: number;
    activeWallets: number;
    totalVolumeMinor: number;
    pending: number;
  };
  users: BackendUserWithWallet[];
}
export interface CreateUserDto extends Email, DisplayName {
  role: string;
}

export interface CreateUserResponse extends Message, Success {
  token?: string;
}
