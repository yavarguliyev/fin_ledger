import { BadRequestException, Inject, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3ClientConfig,
  HeadBucketCommand,
  CreateBucketCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ClientIds, STORAGE_OPTIONS } from '@common/shared-libs';

import { BaseStrategy } from './base/base.strategy';
import { DownloadUrlOptions, StorageModuleOptions } from '../interfaces/storage.interface';

export class S3StorageStrategy extends BaseStrategy {
  private readonly client: S3Client;
  private readonly urlClient: S3Client;
  private readonly bucketName: string;
  private readonly ensureBucketEnabled: boolean;
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private bucketEnsured = false;
  private bucketEnsurePromise: Promise<void> | null = null;

  constructor (@Inject(STORAGE_OPTIONS) options: StorageModuleOptions) {
    super();

    this.clientId = options.clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${S3StorageStrategy.name}:${this.clientId}`);

    if (!options.s3) throw new BadRequestException('S3 configuration is missing');

    this.bucketName = options.s3.bucketName;
    this.ensureBucketEnabled = options.s3.ensureBucket ?? true;

    const endpoint = this.normalizeEndpoint(options.s3.endpoint);
    const publicEndpoint = this.normalizeEndpoint(options.s3.publicEndpoint);

    const config: S3ClientConfig = {
      region: options.s3.region,
      credentials: { accessKeyId: options.s3.accessKeyId, secretAccessKey: options.s3.secretAccessKey },
      forcePathStyle: options.s3.forcePathStyle ?? false,
      ...(endpoint && { endpoint })
    };

    this.client = new S3Client(config);
    this.urlClient = new S3Client({ ...config, ...(publicEndpoint && { endpoint: publicEndpoint }) });

    this.logger.log(`S3 storage strategy initialized for ${this.clientId} with bucket: ${this.bucketName}`);
  }

  async upload (key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void> {
    await this.ensureBucket();
    const command = new PutObjectCommand({ Bucket: this.bucketName, Key: key, Body: body, ContentType: contentType });
    await this.client.send(command);
  }

  async getDownloadUrl (key: string, options?: DownloadUrlOptions): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    return getSignedUrl(this.urlClient, command, { expiresIn: options?.expiresIn ?? 3600 });
  }

  async delete (key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
  }

  async exists (key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as { name: string };
        if (err.name === 'NotFound' || err.name === 'NoSuchKey') return false;
      }

      throw error;
    }
  }

  async listByPrefix (prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({ Bucket: this.bucketName, Prefix: prefix });
      const response = await this.client.send(command);
      return response.Contents?.map(obj => obj.Key).filter((key): key is string => Boolean(key)) ?? [];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as { name: string };
        if (err.name === 'NoSuchBucket') return [];
      }

      throw error;
    }
  }

  override async getTotalUsage (): Promise<number> {
    try {
      let totalSize = 0;
      let continuationToken: string | undefined;

      do {
        const command = new ListObjectsV2Command({ Bucket: this.bucketName, ContinuationToken: continuationToken });
        const response = await this.client.send(command);
        if (response.Contents) totalSize += response.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return totalSize;
    } catch {
      return 0;
    }
  }

  private normalizeEndpoint (endpoint?: string): string | undefined {
    if (!endpoint || !endpoint.trim()) return undefined;
    const trimmed = endpoint.trim();
    if (this.bucketName && trimmed.includes(`${this.bucketName}.s3`)) return trimmed.replace(`${this.bucketName}.s3`, 's3');
    return trimmed;
  }

  private async ensureBucket (): Promise<void> {
    if (this.bucketEnsured || !this.ensureBucketEnabled) return;
    if (this.bucketEnsurePromise) return this.bucketEnsurePromise;

    this.bucketEnsurePromise = (async (): Promise<void> => {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      } catch {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucketName })).catch(() => {});
      }

      this.bucketEnsured = true;
    })();

    return this.bucketEnsurePromise;
  }
}
