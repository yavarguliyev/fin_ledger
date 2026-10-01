import { Injectable, Inject } from '@nestjs/common';
import { Cacheable, CacheEvict, RedisCacheProvider } from '@common/redis';
import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { UploadFileUseCase } from '../use-cases/commands/upload-file.use-case';
import { GetFileUrlUseCase } from '../use-cases/queries/get-file-url.use-case';
import { DeleteFileUseCase } from '../use-cases/commands/delete-file.use-case';
import { DeleteResult } from '../interfaces/delete-result.interface';
import { FileUrlResponse } from '../interfaces/file-url-response.interface';
import { FileUrlsResponse } from '../interfaces/file-urls-response.interface';
import { UploadFileResponse } from '../interfaces/upload-file-response.interface';
import { UploadFilesDto } from '../dtos/service/upload-files.dto';
import { GetFilesDto } from '../dtos/service/get-files.dto';
import { FileSelectionDto } from '../dtos/service/file-selection.dto';
import { ObjectKeyDto } from '../dtos/strategy/object-key.dto';
import { STORAGE_CACHE } from '../constants/cache/storage-cache.constant';
import { StorageCacheHelper } from '../helpers/storage-cache.helper';

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

  @CacheEvict({ keyPrefix: ['storage:file-urls'], isPattern: true, scope: StorageCacheHelper.scopeOf })
  async uploadFiles (dto: UploadFilesDto): Promise<UploadFileResponse> {
    return this.uploadFileUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'storage:file-urls', ttlSeconds: STORAGE_CACHE.URL_TTL_SECONDS, scope: StorageCacheHelper.scopeOf })
  async get (dto: GetFilesDto): Promise<FileUrlResponse | FileUrlsResponse> {
    return this.getFileUrlUseCase.getWithLogic(dto);
  }

  @CacheEvict({ keyPrefix: ['storage:file-urls'], isPattern: true, scope: StorageCacheHelper.scopeOf })
  async delete (dto: FileSelectionDto): Promise<DeleteResult> {
    return this.deleteFileUseCase.deleteWithLogic(dto);
  }

  async fileExists (dto: ObjectKeyDto): Promise<boolean> {
    return this.getFileUrlUseCase['checkExists'](dto);
  }
}
