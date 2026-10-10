import { Bet } from '../../types/betting/bet.type';
import { ToastService } from '../../services/toast.service';

export interface AnnounceBetDto {
  bet: Bet;
  toast: ToastService;
}
