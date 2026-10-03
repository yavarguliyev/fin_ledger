import { ActivatedRouteSnapshot } from '@angular/router';

import { RouteSnapshotFakeDto } from '../interfaces/route-fake.interface';

export const aRouteSnapshot = ({ path, firstChild }: RouteSnapshotFakeDto): ActivatedRouteSnapshot =>
  ({ routeConfig: path === undefined ? null : { path }, firstChild }) as unknown as ActivatedRouteSnapshot;
