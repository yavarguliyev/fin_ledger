export interface CallPost {
  token: string;
  path: string;
  body: object;
}

export interface CallStart {
  media: string;
}

export interface CallStarted {
  callId: string;
}

export interface CallAction {
  callId: string;
  action: string;
}
