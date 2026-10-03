import { setTimeout as sleep } from 'node:timers/promises';

import { PAYMENT_RECONCILIATION as RECON } from '../constants/payment-reconciliation.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import {
  ReconcileAttemptsRow,
  ReconcileBalanceRow,
  ReconcileIdRow,
  ReconcilePaymentDto,
  ReconcilePollDto,
  ReconcileReviewItem,
  ReconcileState,
  StaleDepositDto
} from '../interfaces/payment-reconciliation.interface';

const staleDeposit = async ({ key, status, chargeId, amount, ageHours = RECON.DEFAULT_AGE_HOURS, attempts = 0 }: StaleDepositDto): Promise<string> => {
  const [row] = await DbHelper.query<ReconcileIdRow>({ sql: RECON.STALE_DEPOSIT_SQL, params: [RECON.EMAIL, key, status, chargeId, amount, ageHours, attempts] });
  return row?.id as string;
};

const state = async ({ paymentId }: ReconcilePaymentDto): Promise<ReconcileState> => {
  const [row] = await DbHelper.query<ReconcileState>({ sql: RECON.STATE_SQL, params: [paymentId] });
  return row as ReconcileState;
};

const balance = async (): Promise<number> => {
  const [row] = await DbHelper.query<ReconcileBalanceRow>({ sql: RECON.BALANCE_SQL, params: [RECON.EMAIL] });
  return row?.balance ?? 0;
};

const attemptsOf = async ({ paymentId }: ReconcilePaymentDto): Promise<number | undefined> => {
  const [row] = await DbHelper.query<ReconcileAttemptsRow>({ sql: RECON.ATTEMPTS_SQL, params: [paymentId] });
  return row?.attempts;
};

const statusOf = async ({ paymentId }: ReconcilePaymentDto): Promise<string> => (await state({ paymentId })).status;

const poll = async ({ done }: ReconcilePollDto): Promise<void> => {
  const deadline = Date.now() + RECON.DEADLINE_MS;
  while (!(await done()) && Date.now() < deadline) await sleep(RECON.POLL_MS);
};

afterAll(async () => DbHelper.close());

describe('Payment reconciliation', () => {
  it('completes, fails or leaves open stale deposits according to the provider', async () => {
    const before = await balance();
    const charged = await staleDeposit(RECON.CHARGED);
    const declined = await staleDeposit(RECON.DECLINED);
    const open = await staleDeposit(RECON.OPEN);

    await poll({
      done: async () => (await statusOf({ paymentId: charged })) === RECON.COMPLETED && (await statusOf({ paymentId: declined })) === RECON.FAILED
    });

    await expect(state({ paymentId: charged })).resolves.toEqual(RECON.COMPLETED_ONCE);
    await expect(state({ paymentId: declined })).resolves.toEqual(RECON.FAILED_ONCE);
    await expect(state({ paymentId: open })).resolves.toEqual(RECON.STILL_PROCESSING);
    await expect(balance()).resolves.toBe(before + RECON.CHARGED_MINOR);
  }, RECON.TIMEOUT_MS);

  it('fails stale deposits the provider never saw, found by our payment ID', async () => {
    const neverCharged = await staleDeposit(RECON.NEVER_CHARGED);
    const timedOut = await staleDeposit(RECON.TIMED_OUT);

    await poll({
      done: async () => (await statusOf({ paymentId: neverCharged })) === RECON.FAILED && (await statusOf({ paymentId: timedOut })) === RECON.FAILED
    });

    await expect(state({ paymentId: neverCharged })).resolves.toEqual(RECON.FAILED_ONCE);
    await expect(state({ paymentId: timedOut })).resolves.toEqual(RECON.FAILED_ONCE);
    await expect(DbHelper.query({ sql: RECON.DISTINCT_FAILURE_SQL, params: [[neverCharged, timedOut]] })).resolves.toEqual(RECON.NOT_FOUND_CODE);
  }, RECON.TIMEOUT_MS);
});

describe('Payment reconciliation: abandoned 3-D Secure deposits', () => {
  it('cancels and fails a 3-D Secure deposit the customer abandoned, but keeps a recent one open', async () => {
    const abandoned = await staleDeposit(RECON.ABANDONED);
    const recent = await staleDeposit(RECON.RECENT);

    await poll({ done: async () => (await statusOf({ paymentId: abandoned })) === RECON.FAILED });

    await expect(state({ paymentId: abandoned })).resolves.toEqual(RECON.FAILED_ONCE);
    await expect(DbHelper.query({ sql: RECON.FAILURE_SQL, params: [abandoned] })).resolves.toEqual(RECON.CANCELED_CODE);
    await expect(state({ paymentId: recent })).resolves.toEqual(RECON.STILL_REQUIRES_ACTION);
  }, RECON.TIMEOUT_MS);

  it('flags a deposit the provider keeps reporting as open for manual review, and stops asking about it', async () => {
    const almost = await staleDeposit(RECON.ALMOST);
    const flagged = await staleDeposit(RECON.FLAGGED);

    await poll({ done: async () => (await attemptsOf({ paymentId: almost })) === RECON.MAX_ATTEMPTS });

    await expect(attemptsOf({ paymentId: almost })).resolves.toBe(RECON.MAX_ATTEMPTS);
    await expect(attemptsOf({ paymentId: flagged })).resolves.toBe(RECON.MAX_ATTEMPTS);

    const admin = await ApiHelper.login({ email: RECON.ADMIN_EMAIL });
    const review = await ApiHelper.request<ReconcileReviewItem[]>({ method: 'GET', path: RECON.UNRESOLVED_PATH, token: admin });
    expect(review.status).toBe(RECON.OK);
    expect(review.body.map(({ id }) => id)).toEqual(expect.arrayContaining([almost, flagged]));

    const player = await ApiHelper.login({ email: RECON.EMAIL });
    await expect(ApiHelper.request({ method: 'GET', path: RECON.UNRESOLVED_PATH, token: player })).resolves.toMatchObject({ status: RECON.FORBIDDEN });
  }, RECON.REVIEW_TIMEOUT_MS);
});
