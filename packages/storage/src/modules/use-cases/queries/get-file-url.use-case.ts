import { Injectable } from '@nestjs/common';

import { StorageBaseUseCase } from '../base/storage-base.use-case';
import { FileUrlResponse } from '../../interfaces/file-url-response.interface';
import { FileUrlResults } from '../../interfaces/file-url-results.interface';
import { FileUrlsResponse } from '../../interfaces/file-urls-response.interface';
import { DownloadUrlDto } from '../../dtos/strategy/download-url.dto';
import { GetFilesDto } from '../../dtos/service/get-files.dto';
import { FileIndexDto } from '../../dtos/step/file-index.dto';
import { FileUrlResultsDto } from '../../dtos/step/file-url-results.dto';

const DEFAULT_EXPIRES_IN = 3600;

@Injectable()
export class GetFileUrlUseCase extends StorageBaseUseCase {
  async execute ({ key, expiresIn = DEFAULT_EXPIRES_IN }: DownloadUrlDto): Promise<FileUrlResponse> {
    await this.ensureExists({ key });
    const url = await this.storageStrategy.getDownloadUrl({ key, expiresIn });
    return { url, expiresIn };
  }

  async getWithLogic (dto: GetFilesDto): Promise<FileUrlResponse | FileUrlsResponse> {
    const { key, indexes, expiresIn = DEFAULT_EXPIRES_IN } = dto;
    if (indexes && indexes.length > 0) return this.executeByKey({ key, indexes, expiresIn });
    if (await this.isSingleFile({ key })) return this.execute({ key, expiresIn });
    return this.executeByKey({ key, expiresIn });
  }

  private async executeByKey ({ key, indexes, expiresIn = DEFAULT_EXPIRES_IN }: GetFilesDto): Promise<FileUrlsResponse> {
    const { files, targetFiles } = await this.resolveTargetFiles({ key, indexes });
    const results = await Promise.all(
      targetFiles.map(async filePath => ({ filePath, url: await this.storageStrategy.getDownloadUrl({ key: filePath, expiresIn }) }))
    );

    return { key, files: this.getFileUrlResults({ results, files, indexes }), expiresIn };
  }

  private getFileIndex ({ files, result, indexes, index }: FileIndexDto): number | undefined {
    return indexes ? indexes[index] : files.indexOf(result.filePath);
  }

  private getFileUrlResults ({ results, files, indexes }: FileUrlResultsDto): FileUrlResults[] {
    return results.map((result, index) => ({
      index: this.getFileIndex({ files, result, indexes, index })!,
      path: result.filePath,
      url: result.url
    }));
  }
}
