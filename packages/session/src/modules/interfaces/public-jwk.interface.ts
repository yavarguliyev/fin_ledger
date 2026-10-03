export interface PublicJwk {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

export interface PublicJwkSet {
  keys: PublicJwk[];
}
