export interface AuthResponseFakeDto {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user: { id: string };
}
