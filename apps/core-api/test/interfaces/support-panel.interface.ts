export interface PanelFile {
  id: string;
  kind: string;
  attachment: PanelAttachment | null;
  createdAt: string;
}

export interface PanelLink {
  id: string;
  messageId: string;
  url: string;
  createdAt: string;
}

export interface PanelStorage {
  totalBytes: number;
  ownBytes: number;
  fileCount: number;
  customerTotalBytes?: number;
  files: PanelStoredFile[];
}

export interface PanelRequestDto {
  token: string;
  tab: string;
  query?: string;
}

export interface PanelUploadDto {
  token: string;
  bytes: readonly number[];
  name: string;
  type: string;
}

export interface PanelDeleteDto {
  token: string;
  messageIds: string[];
}

export interface PanelDeleted {
  deleted: number;
}

export interface PanelStoredFile {
  messageId: string;
  mine: boolean;
}

export interface PanelAttachment {
  fileName: string | null;
}
