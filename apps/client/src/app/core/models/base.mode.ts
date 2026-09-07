export interface Id {
  id: string;
}

export interface Email {
  email: string;
}

export interface Password {
  password: string;
}

export interface DisplayName {
  displayName: string;
}

export interface Currency {
  currency: string;
}

export interface UserId {
  userId: string;
}

export interface AccountId {
  accountId: string;
}

export interface TransactionId {
  transactionId: string;
}

export interface WalletId {
  walletId: string | null;
}

export interface AmountMinor {
  amountMinor: number;
}

export interface AvailableBalanceMinor {
  availableBalanceMinor: number;
}

export interface ReservedBalanceMinor {
  reservedBalanceMinor: number;
}

export interface BalanceMinor {
  balanceMinor: number;
}

export interface Reference {
  reference: string | null;
}

export interface Message {
  message: string;
}

export interface Success {
  success: boolean;
}

export interface Roles {
  role: UserRole;
}

export interface CreatedAt {
  createdAt: string;
}

export interface UpdatedAt {
  updatedAt: string;
}

export interface DeletedAt {
  deletedAt: string;
}

export interface TotalPages {
  pageSize: number;
}

export interface TotalItems {
  totalItems: number;
}

export interface CurrentPage {
  currentPage: number;
}

export interface ShowMoreConfig extends TotalPages, TotalItems, CurrentPage {}

export interface PaginationConfig extends TotalPages, TotalItems, CurrentPage {
  availablePageSizes: number[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  toneClass?: string;
}

export interface PageHeader {
  title: string;
  subtitle?: string;
}

export interface HttpError {
  error?: { message?: string };
  message?: string;
  statusText?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator' | 'global admin';
export type LedgerAccountType = 'ASSET' | 'LIABILITY';
export type LedgerWalletTransactionType = 'DEBIT' | 'CREDIT';
export type NotificationType = 'payment' | 'wallet' | 'system' | 'bet';
export type Theme = 'light' | 'dark';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type GameStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'CANCELLED';
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WINNING' | 'CREDIT' | 'DEBIT' | 'CONVERSION_IN' | 'CONVERSION_OUT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethodType = 'BANK_ACCOUNT' | 'DEBIT_CARD';
export type PaymentMethodStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'REMOVED';
