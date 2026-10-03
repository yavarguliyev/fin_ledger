import { AdminApiService } from '../../src/app/core/services/admin-api.service';
import { ToastService } from '../../src/app/core/services/toast.service';
import { UserService } from '../../src/app/core/services/user.service';
import { AdminApiFakeDto } from '../interfaces/admin-api-fake.interface';

export const anAdminApi = ({ dashboard }: AdminApiFakeDto): AdminApiService =>
  ({ getDashboardData: () => dashboard }) as unknown as AdminApiService;

export const aUserService = (): UserService => ({}) as unknown as UserService;

export const aToast = (): ToastService => ({}) as unknown as ToastService;
