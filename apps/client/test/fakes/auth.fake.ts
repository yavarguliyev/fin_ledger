import { AuthResponse } from '../../src/app/core/interfaces/auth/auth-response.interface';
import { AuthResponseFakeDto } from '../interfaces/auth-response-fake.interface';

export const anAuthResponse = ({ tokenType, accessToken, expiresIn, user }: AuthResponseFakeDto): AuthResponse =>
  ({ tokenType, accessToken, expiresIn, user }) as unknown as AuthResponse;
