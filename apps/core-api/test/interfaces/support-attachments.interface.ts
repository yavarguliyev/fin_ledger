import { SupportMessage } from './support-chat.interface';

export interface AttachmentFile {
  content: Buffer;
  name: string;
  type: string;
}

export interface AttachmentUploadDto {
  files: AttachmentFile[];
}

export interface AttachmentEditDto {
  token: string;
  form: FormData;
}

export interface AttachmentTextDto {
  text: string;
}

export interface EditedMessage extends SupportMessage {
  editedAt: string | null;
}
