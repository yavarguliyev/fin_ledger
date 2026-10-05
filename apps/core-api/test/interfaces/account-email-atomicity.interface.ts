export interface AtomicEnabledRow {
  enabled: boolean;
}

export interface AtomicEmailsRow {
  email: string;
  pending_email: string | null;
}

export interface AtomicCountRow {
  count: number;
}

export interface AtomicUserDto {
  userId: string;
}

export interface AtomicEventDto {
  userId: string;
  eventType: string;
}
