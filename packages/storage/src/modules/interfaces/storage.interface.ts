import { ClientIds, StorageStrategy } from '@common/shared-libs';

export interface UploadFile {
  readonly buffer: Buffer;
  readonly mimetype: 'image/png';
  readonly originalname: string;
}

export interface DeleteResult {
  readonly message: string;
}

export interface IndexesOptionalInput {
  readonly indexes?: number[] | undefined;
}

export interface FileUrlResult {
  readonly url: string;
  readonly filePath: string;
}

export interface FileUrlsResponse {
  readonly key: string;
  readonly expiresIn: number;
  readonly files: { readonly url: string; readonly path: string; readonly index: number }[];
}

export interface FileUrlResponse {
  readonly url: string;
  readonly expiresIn: number;
}

export interface DownloadUrlOptions {
  readonly expiresIn?: number;
}

export interface UploadFilesRequest {
  readonly key: string;
  readonly files: UploadFile[];
}

export interface UrlRequest {
  readonly results: unknown[];
  readonly files: string[];
  readonly indexes?: number[] | undefined;
}

export interface UrlFileIndexRequest {
  readonly index: number;
  readonly files: string[];
  readonly result: FileUrlResult;
  readonly indexes?: number[] | undefined;
}

export interface FileUrlResults {
  readonly index: number;
  readonly path: string;
  readonly url: string;
}

export interface StorageModuleOptions {
  readonly clientId?: ClientIds | undefined;
  readonly strategy: StorageStrategy;
  readonly s3?: {
    readonly endpoint?: string | undefined;
    readonly publicEndpoint?: string | undefined;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly region: string;
    readonly bucketName: string;
    readonly forcePathStyle?: boolean | undefined;
    readonly ensureBucket?: boolean | undefined;
  };
}

export interface UploadFileResponse {
  readonly files: string[];
  readonly key: string;
}
