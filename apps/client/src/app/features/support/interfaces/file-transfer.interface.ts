export interface FileTransferDto {
  transfer: Pick<DataTransfer, 'files' | 'types'> | null;
}
