import { ActivatedRouteSnapshot } from '@angular/router';

export interface RouteSnapshotFakeDto {
  path: string | undefined;
  firstChild: ActivatedRouteSnapshot | null;
}
