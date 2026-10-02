import { ProviderError } from '@common/shared-libs';

import { OperationLimiter } from '../../src/modules/resilience/operation-limiter';
import { LIMITER_TEST } from '../constants/operation-limits.constant';

const wait = (ms: number): Promise<string> => new Promise(resolve => setTimeout(() => resolve(LIMITER_TEST.RESULT), ms));

const build = (): OperationLimiter =>
  new OperationLimiter({ label: LIMITER_TEST.LABEL, maxConcurrent: LIMITER_TEST.MAX_CONCURRENT, queueLimit: LIMITER_TEST.QUEUE_LIMIT });

describe('OperationLimiter', () => {
  it('returns the result when the call finishes inside the deadline', async () => {
    const limiter = build();

    await expect(limiter.run({ operation: () => wait(0), deadlineMs: LIMITER_TEST.FAST_MS, label: LIMITER_TEST.LABEL })).resolves.toBe(
      LIMITER_TEST.RESULT
    );
  });

  it('gives up at the deadline instead of letting one call hang', async () => {
    const limiter = build();

    const attempt = limiter.run({
      operation: () => wait(LIMITER_TEST.SLOW_MS),
      deadlineMs: LIMITER_TEST.SHORT_DEADLINE_MS,
      label: LIMITER_TEST.LABEL
    });

    await expect(attempt).rejects.toBeInstanceOf(ProviderError);
    await expect(attempt.catch((error: ProviderError) => error.category)).resolves.toBe(LIMITER_TEST.DEADLINE_CATEGORY);
  });
});

describe('OperationLimiter capacity', () => {
  it('frees the slot again after a call finishes', async () => {
    const limiter = build();

    await limiter.run({ operation: () => wait(0), deadlineMs: LIMITER_TEST.FAST_MS, label: LIMITER_TEST.LABEL });

    expect(limiter.active).toBe(0);
  });

  it('refuses a call once both the slots and the queue are full, without sending it', async () => {
    const limiter = build();
    const slow = (): Promise<string> => wait(LIMITER_TEST.SLOW_MS);
    const inFlight = [
      limiter.run({ operation: slow, deadlineMs: LIMITER_TEST.FAST_MS, label: LIMITER_TEST.LABEL }),
      limiter.run({ operation: slow, deadlineMs: LIMITER_TEST.FAST_MS, label: LIMITER_TEST.LABEL }),
      limiter.run({ operation: slow, deadlineMs: LIMITER_TEST.FAST_MS, label: LIMITER_TEST.LABEL })
    ];

    let sent = false;
    const refused = limiter.run({
      operation: () => {
        sent = true;
        return wait(0);
      },
      deadlineMs: LIMITER_TEST.FAST_MS,
      label: LIMITER_TEST.LABEL
    });

    await expect(refused).rejects.toBeInstanceOf(ProviderError);
    await expect(refused.catch((error: ProviderError) => error.category)).resolves.toBe(LIMITER_TEST.BULKHEAD_CATEGORY);
    expect(sent).toBe(false);

    await Promise.all(inFlight);
  });
});
