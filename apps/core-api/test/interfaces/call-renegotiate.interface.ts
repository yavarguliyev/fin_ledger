export interface CallPostDto {
  token: string;
  path: string;
  body: object;
}

export interface StartedCall {
  callId: string;
}
