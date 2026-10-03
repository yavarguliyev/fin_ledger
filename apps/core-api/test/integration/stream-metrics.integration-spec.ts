import { STREAM_METRICS_TEST as T } from '../constants/stream-metrics.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { chunksOf } from '../fakes/stream.fake';

const firstEvent = async (stream: Response): Promise<void> => {
  const decoder = new TextDecoder();
  let text = '';

  for await (const chunk of chunksOf({ response: stream })) {
    text += decoder.decode(chunk);
    if (text.includes(T.DATA_PREFIX)) return;
  }
};

describe('Request metrics and live streams', () => {
  afterAll(async () => DbHelper.close());

  it('never times a live stream as a request, even after it has pushed messages', async () => {
    await TestUserHelper.ensure({ emails: [T.ARRIVING_EMAIL] });
    const staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    const arriving = await ApiHelper.login({ email: T.ARRIVING_EMAIL });
    const { body } = await ApiHelper.request<{ ticket: string }>({ method: 'POST', path: T.TICKET_PATH, token: staff, body: {} });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), T.TIMEOUT_MS);

    try {
      const stream = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.STREAM_PATH}${body.ticket}`, { signal: controller.signal });
      const pushed = firstEvent(stream);
      await ApiHelper.request({ method: 'POST', path: T.HEARTBEAT_PATH, token: arriving, body: {} });
      await pushed;
    } finally {
      clearTimeout(timer);
      controller.abort();
    }

    const root = (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '');
    const metrics = await (await fetch(`${root}${T.METRICS_PATH}`)).text();

    expect(metrics).toContain(T.TICKET_SERIES);
    expect(metrics).not.toContain(T.STREAM_SERIES);
  });
});
