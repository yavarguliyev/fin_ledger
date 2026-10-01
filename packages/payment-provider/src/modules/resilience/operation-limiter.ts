import { ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { Deadline } from '../interfaces/deadline.interface';
import { LimiterOptions } from '../interfaces/limiter-options.interface';
import { OPERATION_LIMITS } from '../constants/routing/operation-limits.constant';

export class OperationLimiter {
  private readonly label: string;
  private readonly maxConcurrent: number;
  private readonly queueLimit: number;

  private inFlight = 0;
  private queued = 0;

  constructor ({ label, maxConcurrent = OPERATION_LIMITS.MAX_CONCURRENT, queueLimit = OPERATION_LIMITS.QUEUE_LIMIT }: LimiterOptions) {
    this.label = label;
    this.maxConcurrent = maxConcurrent;
    this.queueLimit = queueLimit;
  }

  get active (): number {
    return this.inFlight;
  }

  get waiting (): number {
    return this.queued;
  }

  async run<T> (dto: Deadline<T>): Promise<T> {
    if (this.claim()) return this.release(dto);
    if (this.queued >= this.queueLimit) throw this.rejected();

    this.queued += 1;

    try {
      await this.waitForSlot();
    } finally {
      this.queued -= 1;
    }

    return this.release(dto);
  }

  private async waitForSlot (): Promise<void> {
    while (!this.claim()) {
      await new Promise(resolve => setTimeout(resolve, OPERATION_LIMITS.POLL_MS));
    }
  }

  private claim (): boolean {
    if (this.inFlight >= this.maxConcurrent) return false;
    this.inFlight += 1;
    return true;
  }

  private rejected (): ProviderError {
    return new ProviderError({
      message: `${this.label} ${OPERATION_LIMITS.BULKHEAD_MESSAGE}; no request was sent`,
      category: ProviderErrorCategory.CIRCUIT_OPEN
    });
  }

  private async release<T> (dto: Deadline<T>): Promise<T> {
    try {
      return await OperationLimiter.withDeadline(dto);
    } finally {
      this.inFlight -= 1;
    }
  }

  private static async withDeadline<T> ({ operation, deadlineMs, label }: Deadline<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new ProviderError({ message: `${label} ${OPERATION_LIMITS.DEADLINE_MESSAGE}`, category: ProviderErrorCategory.NETWORK })),
        deadlineMs
      );
    });

    try {
      return await Promise.race([operation(), deadline]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
