import { ANALYTICS_TOPICS_TEST as T } from '../constants/analytics-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import {
  AnalyticsCountRow,
  AnalyticsDeposit,
  AnalyticsDepositDto,
  AnalyticsEventDto,
  AnalyticsIdRow,
  AnalyticsWalletRow,
  AnalyticsWebhookDto
} from '../interfaces/analytics-topics.interface';

let token = '';

let methodId = '';

let wallet = { id: '', currency: '' };

const produced = async ({ eventType }: AnalyticsEventDto): Promise<number> => {
  const [row] = await DbHelper.query<AnalyticsCountRow>({ sql: T.COUNT_SQL, params: [eventType] });

  return row?.count ?? 0;
};

const webhook = ({ type, chargeId }: AnalyticsWebhookDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: T.WEBHOOK_PATH,
    body: { id: `${T.EVENT_PREFIX}${type}_${chargeId}`, type, data: { object: { id: chargeId, metadata: {} } } }
  });

const deposit = ({ idempotencyKey }: AnalyticsDepositDto): ReturnType<typeof ApiHelper.request<AnalyticsDeposit>> =>
  ApiHelper.request<AnalyticsDeposit>({
    method: 'POST',
    path: T.DEPOSIT_PATH,
    token,
    body: { amountMinor: T.DEPOSIT_MINOR, currency: wallet.currency, idempotencyKey, paymentMethodId: methodId }
  });

beforeAll(async () => {
  const [found] = await DbHelper.query<AnalyticsWalletRow>({
    sql: T.WALLET_SQL,
    params: [T.EMAIL]
  });

  wallet = { id: found?.id ?? '', currency: found?.currency ?? '' };

  const [method] = await DbHelper.query<AnalyticsIdRow>({ sql: T.METHOD_SQL, params: [T.EMAIL] });

  methodId = method?.id ?? '';
  token = await ApiHelper.login({ email: T.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Analytics topics', () => {
  it('writes the completed and credited analytics events when a deposit succeeds', async () => {
    const before = {
      completed: await produced({ eventType: T.PAYMENT_COMPLETED }),
      credited: await produced({ eventType: T.WALLET_CREDITED })
    };
    const created = await deposit({ idempotencyKey: T.SUCCESS_KEY });

    expect(created.status).toBe(T.CREATED);

    await webhook({ type: T.SUCCEEDED_EVENT, chargeId: created.body.providerChargeId });

    expect(await produced({ eventType: T.PAYMENT_COMPLETED })).toBe(before.completed + 1);
    expect(await produced({ eventType: T.WALLET_CREDITED })).toBe(before.credited + 1);
  });

  it('writes the failed analytics event when a deposit fails, so the consumer is reachable', async () => {
    const before = await produced({ eventType: T.PAYMENT_FAILED });

    await DbHelper.query({
      sql: T.SEED_PROCESSING_SQL,
      params: [T.EMAIL, wallet.id, methodId, wallet.currency, T.FAILING_CHARGE_ID]
    });

    await webhook({ type: T.FAILED_EVENT, chargeId: T.FAILING_CHARGE_ID });

    expect(await produced({ eventType: T.PAYMENT_FAILED })).toBe(before + 1);
  });
});

describe('Analytics topics for bets', () => {
  it('writes the debited analytics event for a bet placed inside its own transaction', async () => {
    const before = await produced({ eventType: T.WALLET_DEBITED });
    const [event] = await DbHelper.query<AnalyticsIdRow>({ sql: T.EVENT_SQL });

    const bet = await ApiHelper.request({
      method: 'POST',
      path: T.BETS_PATH,
      token,
      body: {
        walletId: wallet.id,
        eventId: event?.id,
        selection: T.SELECTION,
        stakeMinor: T.STAKE_MINOR,
        idempotencyKey: T.BET_KEY
      }
    });

    expect(bet.status).toBe(T.CREATED);
    expect(await produced({ eventType: T.WALLET_DEBITED })).toBe(before + 1);
  });

  it('routes every analytics topic to Kafka, which is where the consumers listen', async () => {
    const topics = [
      T.PAYMENT_COMPLETED,
      T.PAYMENT_FAILED,
      T.WALLET_CREDITED,
      T.WALLET_DEBITED
    ];

    for (const topic of topics) {
      expect(await produced({ eventType: topic })).toBeGreaterThan(0);

      const [row] = await DbHelper.query<AnalyticsCountRow>({ sql: T.KAFKA_SQL, params: [topic] });

      expect(row?.count ?? 0).toBe(0);
    }
  });
});
