import {
  AccountType,
  BetStatus,
  EntryType,
  GameEventStatus,
  NotificationStatus,
  NotificationType,
  OutboxStatus,
  PaymentStatus,
  PaymentType,
  UserRoles,
  UserStatus,
  WalletStatus,
  WebhookStatus
} from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';

interface CheckRow {
  definition: string;
}

const PAIRS: { table: string; column: string; values: string[] }[] = [
  { table: 'users', column: 'role', values: Object.values(UserRoles) },
  { table: 'users', column: 'status', values: Object.values(UserStatus) },
  { table: 'ledger_accounts', column: 'account_type', values: Object.values(AccountType) },
  { table: 'ledger_entries', column: 'entry_type', values: Object.values(EntryType) },
  { table: 'wallets', column: 'status', values: Object.values(WalletStatus) },
  { table: 'payments', column: 'type', values: Object.values(PaymentType) },
  { table: 'payments', column: 'status', values: Object.values(PaymentStatus) },
  { table: 'game_events', column: 'status', values: Object.values(GameEventStatus) },
  { table: 'bets', column: 'status', values: Object.values(BetStatus) },
  { table: 'notifications', column: 'type', values: Object.values(NotificationType) },
  { table: 'notifications', column: 'status', values: Object.values(NotificationStatus) },
  { table: 'outbox_events', column: 'status', values: Object.values(OutboxStatus) },
  { table: 'webhook_events', column: 'status', values: Object.values(WebhookStatus) }
];

describe('Database check constraints match the TypeScript enums', () => {
  afterAll(async () => DbHelper.close());

  it('uses no native enum types, so a value can be added or removed in a transaction', async () => {
    const rows = await DbHelper.query<{ typname: string }>({
      sql: "SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typtype = 'e' AND n.nspname = 'public'"
    });

    expect(rows).toEqual([]);
  });

  it.each(PAIRS)('keeps $table.$column in step with its enum', async ({ table, column, values }) => {
    const [row] = await DbHelper.query<CheckRow>({
      sql: 'SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conname = $1',
      params: [`chk_${table}_${column}`]
    });

    expect(row?.definition).toBeTruthy();

    const listed = [...(row?.definition ?? '').matchAll(/'([^']+)'/g)].map(match => match[1]);

    expect([...listed].sort()).toEqual([...values].sort());
  });
});
