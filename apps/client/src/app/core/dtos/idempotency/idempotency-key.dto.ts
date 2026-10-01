import { IdempotencyScope } from '../../types/http/idempotency-scope.type';

export interface IdempotencyKeyDto {
  scope: IdempotencyScope;
  fingerprint: string;
}
