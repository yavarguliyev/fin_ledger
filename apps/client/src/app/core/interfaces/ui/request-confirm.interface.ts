export interface RequestConfirmDto {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
