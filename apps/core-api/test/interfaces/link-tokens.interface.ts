export interface LinkUrlDto {
  url: string;
}

export interface LinkResetRequestDto {
  email: string;
  count?: number;
}

export interface LinkVerifyDto {
  token: string;
  password?: string;
}

export interface LinkResetDto {
  token: string;
  password: string;
}
