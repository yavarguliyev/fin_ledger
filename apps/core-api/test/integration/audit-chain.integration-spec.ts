import { AUDIT_CHAIN_TEST as T } from '../constants/audit-chain.constant';
import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ChainBreak, ChainEditDto, ChainedRow } from '../interfaces/audit-chain.interface';

const breaks = async (): Promise<string[]> => (await DbHelper.query<ChainBreak>({ sql: T.BREAKS_SQL })).map(row => row.chainSeq);

const editBypassingGuard = async ({ action, chainSeq }: ChainEditDto): Promise<void> => {
  await DbHelper.query({ sql: T.DISABLE_SQL });
  try {
    await DbHelper.query({ sql: T.EDIT_SQL, params: [action, chainSeq] });
  } finally {
    await DbHelper.query({ sql: T.ENABLE_SQL });
  }
};

describe('Audit log hash chain', () => {
  let rows: ChainedRow[] = [];

  beforeAll(async () => {
    rows = await DbHelper.query<ChainedRow>({ sql: T.INSERT_SQL, params: [T.SERVICE, T.ACTION, T.ENTITY, T.ROWS] });
  });

  afterAll(async () => DbHelper.close());

  it('links every new row to the one before it, with no breaks', async () => {
    const sequence = rows.map(row => Number(row.chainSeq));

    expect(sequence).toEqual(sequence.map((_, index) => (sequence[0] ?? 0) + index));
    expect(rows.map(row => row.hasPrev)).toEqual(rows.map(row => Number(row.chainSeq) > 1));
    await expect(breaks()).resolves.toEqual([]);
  });

  it('still refuses an ordinary update', async () => {
    await expect(DbHelper.query({ sql: T.EDIT_SQL, params: [T.EDITED_ACTION, rows[0]?.chainSeq] })).rejects.toThrow(T.APPEND_ONLY);
  });

  it('pinpoints a row edited behind the guard, and heals once it is put back', async () => {
    const target = rows[1]?.chainSeq ?? '';

    await editBypassingGuard({ action: T.EDITED_ACTION, chainSeq: target });
    await expect(breaks()).resolves.toEqual([target]);

    await editBypassingGuard({ action: T.ACTION, chainSeq: target });
    await expect(breaks()).resolves.toEqual([]);
  });

  it('reports the chain as intact on the metrics endpoint', async () => {
    const response = await fetch(`${(process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '')}${T.METRICS_PATH}`);

    expect((await response.text()).match(T.BREAKS_METRIC)?.[1]).toBe(T.INTACT_BREAKS);
  });
});
