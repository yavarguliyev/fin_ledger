import { AuthUser } from '../../types/auth/auth-user.type';

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
