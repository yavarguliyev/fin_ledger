export interface MfaStatus {
  enabled: boolean;
  pending: boolean;
  required: boolean;
}

export interface MfaTokenRef {
  token: string;
}

export interface MfaStatusResponse {
  status: number;
  body: MfaStatus;
}

export interface MfaEnrolment {
  secret: string;
  codes: string[];
}

export interface ActiveCodesRow {
  active: string;
}
