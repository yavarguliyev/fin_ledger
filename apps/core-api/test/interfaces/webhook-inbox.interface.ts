export interface InboxWebhookDto {
  id: string;
  type: string;
  paymentId?: string;
}

export interface InboxEventDto {
  eventId: string;
}

export interface InboxPaymentDto {
  paymentId: string;
}

export interface InboxDepositDto {
  amount: number;
  key: string;
}

export interface InboxStatusRow {
  status: string;
}

export interface InboxIdRow {
  id: string;
}
