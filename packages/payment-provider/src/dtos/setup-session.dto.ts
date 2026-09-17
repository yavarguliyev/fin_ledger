export type CreateSetupSessionDto = {
  customerEmail?: string | undefined;
  returnUrl: string;
};

export type SetupSessionResultDto = {
  url: string;
  sessionId: string;
};
