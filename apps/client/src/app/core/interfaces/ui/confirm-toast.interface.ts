import { Id } from '../base/id.interface';
import { Message } from '../base/message.interface';

export interface ConfirmToast extends Id, Message {
  onConfirm: () => void;
  onCancel: () => void;
}
