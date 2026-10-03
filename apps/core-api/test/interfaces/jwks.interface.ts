export interface JwksKey {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

export interface JwksBody {
  keys: JwksKey[];
}

export interface TokenHeader {
  alg: string;
  kid: string;
}

export interface TokenRefDto {
  token: string;
}
