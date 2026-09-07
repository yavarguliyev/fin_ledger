import { Id, Message, ToastType } from './base.mode';

export interface Toast extends Id, Message {
  type: ToastType;
}

export interface ConfirmToast extends Id, Message {
  onConfirm: () => void;
  onCancel: () => void;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  hideForRoles?: string[];
}
