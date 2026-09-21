import { Logger } from '@nestjs/common';

import { InfrastructureError } from '../errors/infrastructure.error';
import { CircuitBreakerOptionsDto } from '../dtos/resilience/circuit-breaker-options.dto';
import { CIRCUIT_OPEN_CODE } from '../constants/circuit-open-code.constant';
import { RecordFailureDto } from '../dtos/resilience/record-failure.dto';

export class CircuitBreaker {
  private readonly logger: Logger;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly name: string;

  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  constructor ({ name, failureThreshold = 5, resetTimeoutMs = 30_000 }: CircuitBreakerOptionsDto) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.logger = new Logger(`${name}:CircuitBreaker`);
  }

  get isOpen (): boolean {
    if (this.openedAt === null) return false;

    if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
      this.openedAt = null;
      this.consecutiveFailures = this.failureThreshold - 1;
      this.logger.log('Half-open: allowing a trial request');

      return false;
    }

    return true;
  }

  assertClosed (): void {
    if (!this.isOpen) return;

    throw new InfrastructureError({ message: `${this.name} is temporarily unavailable; no request was sent`, code: CIRCUIT_OPEN_CODE, retryable: true, httpStatus: 503 });
  }

  recordSuccess (): void {
    this.consecutiveFailures = 0;
    this.openedAt = null;
  }

  recordFailure ({ retryable }: RecordFailureDto): void {
    if (!retryable) return;

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures < this.failureThreshold) return;

    this.openedAt = Date.now();
    this.logger.warn(`Opened after ${this.consecutiveFailures} retryable failures; pausing for ${this.resetTimeoutMs}ms`);
  }
}
