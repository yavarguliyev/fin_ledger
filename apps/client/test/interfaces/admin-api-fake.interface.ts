import { Observable } from 'rxjs';

import { AdminDashboard } from '../../src/app/core/interfaces/admin/admin-dashboard.interface';
import { AdminUserPage } from '../../src/app/core/interfaces/admin/admin-user-page.interface';

export interface AdminApiFakeDto {
  dashboard: Observable<AdminDashboard>;
  page?: Observable<AdminUserPage>;
}
