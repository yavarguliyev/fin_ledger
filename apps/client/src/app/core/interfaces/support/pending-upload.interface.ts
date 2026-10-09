import { PendingUploadFile } from './pending-upload-file.interface';

export interface PendingUpload {
  localId: string;
  conversationId: string;
  body: string;
  files: PendingUploadFile[];
}
