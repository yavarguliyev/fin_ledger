import { LINK_PREVIEW_TEST as T } from '../constants/link-preview.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { LinkPreviewQueryDto } from '../interfaces/link-preview.interface';

let token = '';

const preview = ({ url, token: bearer = token }: LinkPreviewQueryDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ path: `${T.PATH}${T.QUERY_SEPARATOR}${new URLSearchParams({ url }).toString()}`, ...(bearer && { token: bearer }) });

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.EMAIL] });
  token = await ApiHelper.login({ email: T.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Link previews', () => {
  it.each(T.REFUSED_URLS)('refuses to fetch %s, so the server cannot be pointed at itself or the network', async url => {
    await expect(preview({ url })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });

  it('refuses something that is not a link', async () => {
    await expect(preview({ url: T.MALFORMED })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });

  it('needs a signed-in user', async () => {
    await expect(preview({ url: T.SAFE_URL, token: '' })).resolves.toMatchObject({ status: T.UNAUTHORIZED });
  });
});
