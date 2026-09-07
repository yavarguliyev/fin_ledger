import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageType } from '@common/shared-libs';

import { BaseStrategy } from '../../strategies/base/base.strategy';

@Injectable()
export abstract class StorageBaseUseCase<TSingleResult = unknown, TMultiResult = unknown> {
  protected abstract readonly storageType: StorageType;

  constructor (protected readonly storageStrategy: BaseStrategy) {}

  protected async checkExists (key: string): Promise<boolean> {
    return this.storageStrategy.exists(key);
  }

  protected getFileExtension (filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }

  protected async ensureExists (key: string): Promise<void> {
    const exists = await this.storageStrategy.exists(key);
    if (!exists) throw new NotFoundException('File not found');
  }

  protected async getFilesWithPrefix (key: string): Promise<string[]> {
    const files = await this.storageStrategy.listByPrefix(key);
    if (files.length === 0) throw new NotFoundException(`No files found for key: ${key}`);
    return files;
  }

  protected filterFilesByIndexes (files: string[], indexes?: number[]): string[] {
    if (!indexes || indexes.length === 0) return files;

    const filtered = indexes
      .filter(idx => idx >= 0 && idx < files.length)
      .map(idx => files[idx])
      .filter((file): file is string => file !== undefined);

    if (filtered.length === 0) throw new NotFoundException(`Invalid indexes provided`);
    return filtered;
  }

  protected async executeSingleFile<TParams extends unknown[]> (
    key: string,
    operation: (key: string, ...params: TParams) => Promise<TSingleResult>,
    ...params: TParams
  ): Promise<TSingleResult> {
    await this.ensureExists(key);
    return operation(key, ...params);
  }

  protected async executeMultiFile<TParams extends unknown[]> (
    key: string,
    indexes: number[] | undefined,
    operation: (filePath: string, ...params: TParams) => Promise<unknown>,
    resultBuilder: (files: string[], results: unknown[], indexes?: number[]) => TMultiResult,
    ...params: TParams
  ): Promise<TMultiResult> {
    const files = await this.getFilesWithPrefix(key);
    const targetFiles = this.filterFilesByIndexes(files, indexes);
    const results = await Promise.all(targetFiles.map(filePath => operation(filePath, ...params)));
    return resultBuilder(files, results, indexes);
  }
}
