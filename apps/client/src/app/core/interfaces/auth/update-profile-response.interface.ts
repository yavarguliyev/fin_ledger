import { AuthUser } from './auth-user.interface';

export interface UpdateProfileResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}
