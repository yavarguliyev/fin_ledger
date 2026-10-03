import { Observable } from 'rxjs';

import { AdminDashboard } from '../../src/app/core/interfaces/admin/admin-dashboard.interface';

export interface AdminApiFakeDto {
  dashboard: Observable<AdminDashboard>;
}
