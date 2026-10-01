import { PROFILE_IMAGES_KEY_TEST } from '../constants/profile-images-key.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Profile images key', () => {
  let token = '';
  let ownerId = '';

  const storedKey = async (email: string): Promise<string | null> => {
    const [row] = await DbHelper.query<{ key: string | null }>({ sql: PROFILE_IMAGES_KEY_TEST.SELECT_SQL, params: [email] });

    return row?.key ?? null;
  };

  beforeAll(async () => {
    token = await ApiHelper.login({ email: PROFILE_IMAGES_KEY_TEST.OWNER_EMAIL });

    const [row] = await DbHelper.query<{ id: string }>({
      sql: 'SELECT id FROM users WHERE email = $1',
      params: [PROFILE_IMAGES_KEY_TEST.OWNER_EMAIL]
    });

    ownerId = row?.id ?? '';
  });

  afterAll(async () => {
    await DbHelper.close();
  });

  it('ignores a storage key sent by the client, so nobody can point at another account files', async () => {
    const victimKeyBefore = await storedKey(PROFILE_IMAGES_KEY_TEST.VICTIM_EMAIL);

    const response = await ApiHelper.request({
      method: 'PATCH',
      path: PROFILE_IMAGES_KEY_TEST.PROFILE_PATH,
      token,
      body: {
        displayName: PROFILE_IMAGES_KEY_TEST.DISPLAY_NAME,
        profileImagesKey: PROFILE_IMAGES_KEY_TEST.FORGED_KEY
      }
    });

    expect(response.status).toBe(PROFILE_IMAGES_KEY_TEST.OK);
    expect(await storedKey(PROFILE_IMAGES_KEY_TEST.OWNER_EMAIL)).not.toBe(PROFILE_IMAGES_KEY_TEST.FORGED_KEY);
    expect(await storedKey(PROFILE_IMAGES_KEY_TEST.VICTIM_EMAIL)).toBe(victimKeyBefore);
  });

  it('derives the key from the authenticated user when images are added', async () => {
    const response = await ApiHelper.request({
      method: 'PATCH',
      path: PROFILE_IMAGES_KEY_TEST.PROFILE_PATH,
      token,
      body: {
        imageAction: 'add',
        profileImages: ['probe.webp'],
        profileImagesKey: PROFILE_IMAGES_KEY_TEST.FORGED_KEY
      }
    });

    expect(response.status).toBe(PROFILE_IMAGES_KEY_TEST.OK);
    expect(await storedKey(PROFILE_IMAGES_KEY_TEST.OWNER_EMAIL)).toBe(`${PROFILE_IMAGES_KEY_TEST.KEY_PREFIX}${ownerId}`);
  });
});
