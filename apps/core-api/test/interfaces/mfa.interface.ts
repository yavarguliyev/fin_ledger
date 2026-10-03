export interface MfaTokenRef {
  token: string;
}

export interface MfaEnrolment {
  secret: string;
  recoveryCodes: string[];
}

export interface MfaSetupBody {
  otpauthUri: string;
  qrCodeDataUrl: string;
}

export interface MfaDisable {
  token: string;
  password?: string;
  code: string;
}

export interface MfaVerify {
  challengeToken: string;
  code: string;
}

export interface MfaEmailRef {
  email: string;
}

export interface MfaLoginBody {
  mfaRequired?: boolean;
  challengeToken?: string;
  accessToken?: string;
}

export interface MfaTokenRow {
  failed_attempts: number;
  revoked: boolean;
  used: boolean;
}

export interface MfaUriRef {
  otpauthUri: string;
}

export interface MfaChallengeRef {
  challengeToken: string;
}

export interface MfaSecretRef {
  secret: string;
}

export interface MfaEnabledBody {
  recoveryCodes: string[];
}
