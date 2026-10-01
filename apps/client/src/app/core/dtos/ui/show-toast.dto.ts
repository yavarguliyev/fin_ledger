import { ToastType } from '../../types/ui/toast-type.type';

export interface ShowToastDto {
  message: string;
  type?: ToastType;
}
