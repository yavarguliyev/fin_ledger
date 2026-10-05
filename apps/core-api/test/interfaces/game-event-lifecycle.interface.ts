export interface LifecycleEvent {
  id: string;
  status: string;
  result?: string | null;
}

export interface LifecycleStatusDto {
  eventId: string;
  status: string;
  token?: string;
}

export interface LifecycleBetDto {
  eventId: string;
}

export interface LifecycleIdRow {
  id: string;
}
