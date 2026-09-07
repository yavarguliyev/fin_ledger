import { Injectable, Inject } from '@nestjs/common';
import { Cacheable, CacheEvict, RedisCacheProvider } from '@common/redis';
import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { UploadFileUseCase } from '../use-cases/commands/upload-file.use-case';
import { GetFileUrlUseCase } from '../use-cases/queries/get-file-url.use-case';
import { DeleteFileUseCase } from '../use-cases/commands/delete-file.use-case';
import { DeleteResult, FileUrlResponse, FileUrlsResponse, UploadFileResponse, UploadFilesRequest } from '../interfaces/storage.interface';

@Injectable()
export class StorageService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getFileUrlUseCase: GetFileUrlUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['storage:file-urls'], isPattern: true })
  async uploadFiles (dto: UploadFilesRequest): Promise<UploadFileResponse> {
    return this.uploadFileUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'storage:file-urls', ttlSeconds: 82800 })
  async get (key: string, indexes?: number[], expiresIn?: number): Promise<FileUrlResponse | FileUrlsResponse> {
    return this.getFileUrlUseCase.getWithLogic(key, indexes, expiresIn);
  }

  @CacheEvict({ keyPrefix: ['storage:file-urls'], isPattern: true })
  async delete (key: string, indexes?: number[]): Promise<DeleteResult> {
    return this.deleteFileUseCase.deleteWithLogic(key, indexes);
  }

  async fileExists (key: string): Promise<boolean> {
    return this.getFileUrlUseCase['checkExists'](key);
  }
}
