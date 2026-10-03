import { ActivatedRouteSnapshot } from '@angular/router';

import { PageViewHelper } from '../../../src/app/core/helpers/telemetry/page-view.helper';
import { PAGE_VIEW_TEST as T } from '../../constants/page-view.constant';
import { aRouteSnapshot } from '../../fakes/route.fake';

const chain = (...paths: (string | undefined)[]): ActivatedRouteSnapshot =>
  paths.reduceRight<ActivatedRouteSnapshot | null>(
    (child, path) => aRouteSnapshot({ path, firstChild: child }),
    null
  ) as ActivatedRouteSnapshot;

describe('PageViewHelper.routeTemplate', () => {
  it('builds the route pattern, never the ids in the URL', () => {
    expect(PageViewHelper.routeTemplate({ root: chain(undefined, '', 'admin', 'users/:id') })).toBe(T.ADMIN_USER_ROUTE);
    expect(PageViewHelper.routeTemplate({ root: chain(undefined, '', 'wallet') })).toBe(T.WALLET_ROUTE);
  });
});
