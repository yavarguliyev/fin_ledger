export interface GetImageUrl {
  key: string;
  files: Array<{ index: number; path: string; url: string }>;
  expiresIn: number;
}
