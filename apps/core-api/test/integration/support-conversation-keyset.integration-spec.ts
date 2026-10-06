import { SUPPORT_CONVERSATION_KEYSET_TEST as T } from '../constants/support-conversation-keyset.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import {
  ConversationIdRow,
  ConversationPageCursor,
  ConversationPageQuery,
  ConversationPageRow
} from '../interfaces/support-conversation-page.interface';

let token: string = T.EMPTY;

const page = ({ query }: ConversationPageQuery): ReturnType<typeof ApiHelper.request<ConversationPageRow[]>> =>
  ApiHelper.request<ConversationPageRow[]>({ path: `${T.PATH}${T.QUERY_SEPARATOR}${new URLSearchParams(query).toString()}`, token });

const cursorAfter = ({ row }: ConversationPageCursor): Record<string, string> => ({
  limit: String(T.PAGE),
  before: row?.lastMessageAt ?? T.EMPTY,
  beforeId: row?.id ?? T.EMPTY
});

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.EMAIL] });
  await DbHelper.query({ sql: T.CLEAN_SQL, params: [T.EMAIL] });
  await DbHelper.query({ sql: T.SEED_SQL, params: [T.EMAIL, T.COUNT] });
  token = await ApiHelper.login({ email: T.EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: T.CLEAN_SQL, params: [T.EMAIL] });
  await DbHelper.close();
});

describe('Support conversations paged by cursor', () => {
  it('walks every conversation newest first, including ties and rows within one millisecond', async () => {
    const ids: string[] = [];
    let response = await page({ query: { limit: String(T.PAGE) } });

    while (response.body.length > 0) {
      expect(response.status).toBe(T.OK);
      ids.push(...response.body.map(row => row.id));
      response = await page({ query: cursorAfter({ row: response.body.at(-1) }) });
    }

    const expected = await DbHelper.query<ConversationIdRow>({ sql: T.IDS_SQL, params: [T.EMAIL] });
    expect(ids).toEqual(expected.map(row => row.id));
    expect(ids).toHaveLength(T.COUNT);
  });

  it('refuses half a cursor', async () => {
    await expect(page({ query: { before: new Date().toISOString() } })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
