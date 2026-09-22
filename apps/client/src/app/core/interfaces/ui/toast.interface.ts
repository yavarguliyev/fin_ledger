import { ToastType } from '../../types/ui/toast-type.type';
import { Id } from '../base/id.interface';
import { Message } from '../base/message.interface';

export interface Toast extends Id, Message {
  type: ToastType;
}
