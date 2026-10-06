export interface PrivacyToggleDto {
  token: string;
  enabled: boolean;
}

export interface PrivacyDownloadDto {
  token: string;
  messageId: string;
}

export interface PrivacyState {
  privacyEnabled: boolean;
}

export interface DownloadLink {
  url: string;
}

export interface UploadedMessage {
  id: string;
}
