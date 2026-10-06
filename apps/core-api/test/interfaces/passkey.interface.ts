export interface PasskeyOptions {
  challenge: string;
  rp?: { id?: string; name?: string };
  allowCredentials?: { id: string }[];
}

export interface PasskeySummary {
  id: string;
  deviceLabel: string | null;
  backedUp: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface StepUpWithdrawal {
  suffix: string;
}

export interface StepUpError {
  error?: { message: string };
}
