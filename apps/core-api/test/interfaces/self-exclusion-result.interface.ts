export interface SelfExclusionResult {
  status: boolean;
  message: string;
  selfExclusionUntil: string;
}

export interface ExclusionPeriod {
  period: string;
}

export interface ExclusionResponse {
  status: number;
  body: SelfExclusionResult;
}

export interface ExclusionUntilRow {
  until: string | null;
}
