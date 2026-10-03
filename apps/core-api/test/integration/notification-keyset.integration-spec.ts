import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { NOTIFICATION_KEYSET_TEST as T } from '../constants/notification-keyset.constant';
import { NotificationItem } from '../interfaces/notification-page.interface';
import { TestUserHelper } from '../helpers/test-user.helper';

let token = '';

const page = (query: string): ReturnType<typeof ApiHelper.request<NotificationItem[]>> => ApiHelper.request<NotificationItem[]>({ path: `${T.PATH}?${query}`, token });

const cursorAfter = (item: NotificationItem | undefined): string =>
  new URLSearchParams({ limit: String(T.PAGE), before: item?.createdAt ?? '', beforeId: item?.id ?? '' }).toString();

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.EMAIL] });
  await DbHelper.query({ sql: T.CLEAN_SQL });
  await DbHelper.query({ sql: T.SEED_SQL, params: [T.EMAIL, T.COUNT] });
  token = await ApiHelper.login({ email: T.EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: T.CLEAN_SQL });
  await DbHelper.close();
});

describe('Notifications paged by cursor', () => {
  it('walks every notification newest first, a page at a time, without repeats or gaps', async () => {
    const seen: NotificationItem[] = [];
    let response = await page(new URLSearchParams({ limit: String(T.PAGE) }).toString());

    while (response.body.length > 0) {
      expect(response.status).toBe(T.OK);
      seen.push(...response.body);
      response = await page(cursorAfter(response.body.at(-1)));
    }

    const titles = seen.map(item => item.title).filter(title => title.startsWith(T.TITLE_PREFIX));
    expect(titles).toEqual(Array.from({ length: T.COUNT }, (_, index) => `${T.TITLE_PREFIX}${index + 1}`));
    expect(new Set(seen.map(item => item.id)).size).toBe(seen.length);
  });

  it('refuses half a cursor', async () => {
    await expect(page(new URLSearchParams({ before: new Date().toISOString() }).toString())).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
