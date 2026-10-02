import { PAGE_VIEW } from '../../constants/telemetry/page-view.constant';
import { RouteSnapshotDto } from '../../interfaces/telemetry/route-snapshot.interface';

export class PageViewHelper {
  static routeTemplate ({ root }: RouteSnapshotDto): string {
    const segments: string[] = [];
    let node: RouteSnapshotDto['root'] | null = root;

    while (node) {
      const path = node.routeConfig?.path;
      if (path) segments.push(path);
      node = node.firstChild;
    }

    return `${PAGE_VIEW.ROOT}${segments.join(PAGE_VIEW.SEPARATOR)}`;
  }
}
