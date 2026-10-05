import { PAGE_VIEW_TEST as T } from '../constants/page-view.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { PageViewSendDto } from '../interfaces/page-view.interface';

const send = ({ body, type }: PageViewSendDto): Promise<Response> =>
  fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.PATH}`, { method: T.METHOD, headers: { [T.CONTENT_TYPE_HEADER]: type }, body });

describe('Page view telemetry', () => {
  it('accepts a page summary sent as a plain-text beacon and records it per page', async () => {
    const summary = JSON.stringify({ route: T.ROUTE, initialCalls: T.INITIAL, laterCalls: T.LATER, duplicates: T.DUPLICATES });

    await expect(send({ body: summary, type: T.TEXT_TYPE })).resolves.toMatchObject({ status: T.NO_CONTENT });

    const root = (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '');
    const metrics = await (await fetch(`${root}${T.METRICS_PATH}`)).text();

    expect(metrics).toContain(T.INITIAL_SERIES);
    expect(metrics).toContain(T.DUPLICATE_SERIES);
  });

  it('lets the client on another port of the same site read the beacon response', async () => {
    const summary = JSON.stringify({ route: T.ROUTE, initialCalls: T.INITIAL, laterCalls: T.LATER, duplicates: T.DUPLICATES });
    const response = await send({ body: summary, type: T.TEXT_TYPE });

    expect(response.headers.get(T.RESOURCE_POLICY_HEADER)).toBe(T.RESOURCE_POLICY);
  });

    it('rejects a route that is not a route template, so labels stay clean', async () => {
    const summary = JSON.stringify({ route: T.BAD_ROUTE, initialCalls: T.INITIAL, laterCalls: T.LATER, duplicates: T.DUPLICATES });

    await expect(send({ body: summary, type: T.JSON_TYPE })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
