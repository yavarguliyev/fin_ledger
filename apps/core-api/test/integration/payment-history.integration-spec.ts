import { PAYMENT_HISTORY } from '../constants/payment-history.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { HistoryIdRow, HistoryRow, HistoryTransactionRow, HistoryWebhookDto } from '../interfaces/payment-history.interface';

let paymentId: string;

const webhook = ({ type }: HistoryWebhookDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: PAYMENT_HISTORY.WEBHOOK_PATH,
    body: { id: `${PAYMENT_HISTORY.EVENT_PREFIX}${Date.now()}`, type, data: { object: { id: PAYMENT_HISTORY.CHARGE_ID, metadata: {} } } }
  });

const history = (): Promise<HistoryRow[]> => DbHelper.query<HistoryRow>({ sql: PAYMENT_HISTORY.HISTORY_SQL, params: [paymentId] });

beforeAll(async () => {
  const [method] = await DbHelper.query<HistoryIdRow>({ sql: PAYMENT_HISTORY.METHOD_SQL, params: [PAYMENT_HISTORY.EMAIL] });

  const [payment] = await DbHelper.query<HistoryIdRow>({
    sql: PAYMENT_HISTORY.PAYMENT_SQL,
    params: [PAYMENT_HISTORY.EMAIL, method?.id, PAYMENT_HISTORY.CHARGE_ID]
  });

  paymentId = payment?.id as string;
});

afterAll(async () => DbHelper.close());

describe('Payment status history and financial immutability', () => {
  it('records the transition the state machine made, with the status it came from', async () => {
    await expect(webhook({ type: PAYMENT_HISTORY.SUCCEEDED })).resolves.toMatchObject({ status: PAYMENT_HISTORY.OK });

    const rows = await history();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[rows.length - 1]).toMatchObject({ from_status: PAYMENT_HISTORY.PROCESSING, to_status: PAYMENT_HISTORY.COMPLETED });
    expect(rows[rows.length - 1]?.source).toBeTruthy();
  });

  it('refuses to rewrite or erase a transition once it is recorded', async () => {
    await expect(DbHelper.query({ sql: PAYMENT_HISTORY.REWRITE_HISTORY_SQL, params: [paymentId] })).rejects.toThrow();
    await expect(DbHelper.query({ sql: PAYMENT_HISTORY.ERASE_HISTORY_SQL, params: [paymentId] })).rejects.toThrow();
  });

  it('refuses to change the amount of a wallet transaction that was already written', async () => {
    await expect(DbHelper.query({ sql: PAYMENT_HISTORY.CHANGE_AMOUNT_SQL })).rejects.toThrow(PAYMENT_HISTORY.IMMUTABLE);
  });

  it('still lets the status move, so a state machine is not blocked', async () => {
    const [row] = await DbHelper.query<HistoryTransactionRow>({ sql: PAYMENT_HISTORY.ANY_TRANSACTION_SQL });

    await expect(DbHelper.query({ sql: PAYMENT_HISTORY.SET_STATUS_SQL, params: [row?.status, row?.id] })).resolves.toBeDefined();
  });

  it('no longer accepts the retired FAILED outbox status', async () => {
    await expect(DbHelper.query({ sql: PAYMENT_HISTORY.RETIRED_OUTBOX_SQL, params: [paymentId, Date.now()] })).rejects.toThrow();
  });
});
