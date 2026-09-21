export interface FileUrlsResponse {
  readonly key: string;
  readonly expiresIn: number;
  readonly files: { readonly url: string; readonly path: string; readonly index: number }[];
}
