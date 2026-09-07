import { Password, Email, DisplayName, Roles, Id, UserId, UserRole, WalletId, Message, Success, Currency } from './base.mode';

export interface StoredUser extends AuthUser, Password {}
export interface LoginRequest extends Email, Password {}
export interface SessionData extends Email, DisplayName, Roles, UserId {}
export interface DeleteResponse extends Message, Success {}
export interface FormState extends DisplayName, Currency {}

export interface RegisterDto extends Email, Password, DisplayName {
  role?: UserRole;
}

export interface ProfileFields extends DisplayName {
  currency?: string;
}

export interface UploadRequest {
  key: string;
  files: string[];
}

export interface UpdateProfileResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export interface GetImageUrl {
  key: string;
  files: Array<{ index: number; path: string; url: string }>;
  expiresIn: number;
}

export interface VisibleImages {
  index: number;
  url: string;
  path: string;
}

export interface AuthUser extends Id, Email, DisplayName, Roles, WalletId {
  ledgerAccountId: string | null;
  profileImagesKey: string | null;
  profileImages: string[];
  profileImageIndex: number;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface UpdateProfileRequest {
  displayName?: string;
  currency?: string;
  profileImages?: string[];
  profileImageIndex?: number;
  profileImagesKey?: string;
  imageAction?: 'add' | 'delete_all' | 'delete_by_index';
  deleteIndexes?: number[];
}
