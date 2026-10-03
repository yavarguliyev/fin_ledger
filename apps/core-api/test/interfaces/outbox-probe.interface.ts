import type { Client, Pool } from 'pg';

export interface ClaimedRow {
  id: string;
}

export interface OutboxEventRow {
  status: string;
  attempts: number;
  locked_by: string | null;
  delay_seconds: string;
}

export interface SeedOutboxEvent {
  lockedBy?: string;
  lockOffsetSeconds?: number;
  availableInSeconds?: number;
}

export interface OutboxEventRef {
  id: string;
}

export interface OutboxStatusWait {
  id: string;
  status: string;
}

export interface OutboxPoolClaim {
  pool: Pool;
  lockedBy: string;
}

export interface OutboxClientClaim {
  client: Client;
  ids: string[];
  lockedBy: string;
}

export interface OutboxReschedule {
  id: string;
  attempts: number;
}
