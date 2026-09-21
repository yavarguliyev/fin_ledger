import { ClientIds, StorageStrategy } from '@common/shared-libs';

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
