import { readFileSync } from 'node:fs';

import { NOTIFICATION_LOAD_TEST as T } from '../constants/notification-load.constant';

describe('Notifications on sign-in', () => {
  it('loads the list only when the sign-in state changes, not when the stream reads the access token', () => {
    const body = T.EFFECT_BODY.exec(readFileSync(T.APP, T.ENCODING))?.[1] ?? '';

    expect(body).toMatch(T.UNTRACKED_LOAD);
  });

  it('leaves the dashboard to the list the app root already loads, so the first load sends one request', () => {
    expect(readFileSync(T.DASHBOARD, T.ENCODING)).not.toContain(T.LOAD_CALL);
  });
});
