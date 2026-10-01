import { routes } from '../../src/app/app.routes';
import { APP_ROUTES_TEST } from '../constants/app-routes.constant';

describe('app routes', () => {
  const signedIn = routes.find(route => route.children?.some(child => child.path === APP_ROUTES_TEST.SIGNED_IN_CHILD));

  it('checks the session and the two-factor rule on every page change inside the app, not only on first entry', () => {
    expect(signedIn?.canActivate).toHaveLength(APP_ROUTES_TEST.SINGLE_GUARD);
    expect(signedIn?.canActivateChild).toHaveLength(APP_ROUTES_TEST.SINGLE_GUARD);
  });
});
