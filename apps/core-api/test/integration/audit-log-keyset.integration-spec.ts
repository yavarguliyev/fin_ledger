import { AUDIT_LOG_KEYSET_TEST as T } from '../constants/audit-log-keyset.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { AuditLogIdRow, AuditLogPageCursor, AuditLogPageQuery, AuditLogPageRow } from '../interfaces/audit-log-page.interface';

let admin: string = T.EMPTY;

const page = ({ query }: AuditLogPageQuery): ReturnType<typeof ApiHelper.request<AuditLogPageRow[]>> =>
  ApiHelper.request<AuditLogPageRow[]>({ path: `${T.PATH}${T.QUERY_SEPARATOR}${new URLSearchParams(query).toString()}`, token: admin });

const cursorAfter = ({ row }: AuditLogPageCursor): Record<string, string> => ({
  limit: String(T.PAGE),
  before: row?.createdAt ?? T.EMPTY,
  beforeId: row?.id ?? T.EMPTY
});

beforeAll(async () => {
  admin = await ApiHelper.login({ email: T.GLOBAL_ADMIN_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Audit log paged by cursor', () => {
  it('walks the log newest first without repeats or gaps', async () => {
    const ids: string[] = [];
    let response = await page({ query: { limit: String(T.PAGE) } });
    const first = response.body[0];

    while (response.body.length > 0) {
      expect(response.status).toBe(T.OK);
      ids.push(...response.body.map(row => row.id));
      response = await page({ query: cursorAfter({ row: response.body.at(-1) }) });
    }

    const expected = await DbHelper.query<AuditLogIdRow>({ sql: T.IDS_UP_TO_SQL, params: [first?.createdAt, first?.id] });
    expect(ids).toEqual(expected.map(row => row.id));
  });

  it('refuses half a cursor and a malformed entity id', async () => {
    await expect(page({ query: { before: new Date().toISOString() } })).resolves.toMatchObject({ status: T.BAD_REQUEST });
    await expect(page({ query: { entityId: T.NOT_A_UUID } })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
