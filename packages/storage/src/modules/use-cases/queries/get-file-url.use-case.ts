import { Injectable } from '@nestjs/common';
import { StorageType } from '@common/shared-libs';

import { BaseStrategy } from '../../strategies/base/base.strategy';
import { StorageBaseUseCase } from '../base/storage-base.use-case';
import {
  FileUrlResponse,
  FileUrlResult,
  FileUrlResults,
  FileUrlsResponse,
  UrlFileIndexRequest,
  UrlRequest
} from '../../interfaces/storage.interface';

@Injectable()
export class GetFileUrlUseCase extends StorageBaseUseCase<FileUrlResponse, FileUrlsResponse> {
  protected readonly storageType: StorageType = StorageType.GET;

  constructor (protected override readonly storageStrategy: BaseStrategy) {
    super(storageStrategy);
  }

  async execute (key: string, expiresIn = 3600): Promise<FileUrlResponse> {
    return this.executeSingleFile(
      key,
      async (k, exp) => {
        const url = await this.getUrl(k, exp);
        return { url, expiresIn: exp };
      },
      expiresIn
    );
  }

  protected async executeByKey (key: string, indexes?: number[], expiresIn = 3600): Promise<FileUrlsResponse> {
    return this.executeMultiFile(
      key,
      indexes,
      async (filePath, exp) => ({ filePath, url: await this.getUrl(filePath, exp) }),
      (files: string[], results: unknown[], idxs: number[] | undefined) => ({
        key,
        files: this.getFileUrlResults({ results, files, indexes: idxs }),
        expiresIn
      }),
      expiresIn
    );
  }

  async getWithLogic (key: string, indexes?: number[], expiresIn = 3600): Promise<FileUrlResponse | FileUrlsResponse> {
    if (indexes && indexes.length > 0) return this.executeByKey(key, indexes, expiresIn);
    const files = await this.storageStrategy.listByPrefix(key);
    if (files.length === 0 || (files.length === 1 && files[0] === key)) return this.execute(key, expiresIn);
    return this.executeByKey(key, undefined, expiresIn);
  }

  private async getUrl (filePath: string, exp: number): Promise<string> {
    return await this.storageStrategy.getDownloadUrl(filePath, { expiresIn: exp });
  }

  private getFileIndex (params: UrlFileIndexRequest): number | undefined {
    const { files, result, indexes, index } = params;
    return indexes ? indexes[index] : files.indexOf(result.filePath);
  }

  private getFileUrlResults (params: UrlRequest): FileUrlResults[] {
    const { results, files, indexes } = params;
    const urlResults = results as FileUrlResult[];

    return urlResults.map((result, index) => {
      return {
        index: this.getFileIndex({ files, result, indexes, index })!,
        path: result.filePath,
        url: result.url
      };
    });
  }
}
