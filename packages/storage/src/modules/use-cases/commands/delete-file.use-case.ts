import { Injectable } from '@nestjs/common';
import { StorageType } from '@common/shared-libs';

import { BaseStrategy } from '../../strategies/base/base.strategy';
import { StorageBaseUseCase } from '../base/storage-base.use-case';
import { DeleteResult } from '../../interfaces/storage.interface';

@Injectable()
export class DeleteFileUseCase extends StorageBaseUseCase<DeleteResult, DeleteResult> {
  protected readonly storageType: StorageType = StorageType.DELETE;

  constructor (protected override readonly storageStrategy: BaseStrategy) {
    super(storageStrategy);
  }

  async execute (key: string): Promise<DeleteResult> {
    return this.executeSingleFile(key, async k => {
      await this.storageStrategy.delete(k);
      return { message: 'File deleted successfully' };
    });
  }

  protected async executeByKey (key: string, indexes?: number[]): Promise<DeleteResult> {
    return this.executeMultiFile(
      key,
      indexes,
      async filePath => this.storageStrategy.delete(filePath),
      (files, _results, idxs) => {
        const count = idxs?.length ?? files.length;
        return { message: idxs ? `Deleted ${count} file(s)` : 'Deleted all files' };
      }
    );
  }

  async deleteWithLogic (key: string, indexes?: number[]): Promise<DeleteResult> {
    if (indexes && indexes.length > 0) return this.executeByKey(key, indexes);
    const files = await this.storageStrategy.listByPrefix(key);
    if (files.length === 0 || (files.length === 1 && files[0] === key)) return this.execute(key);
    return this.executeByKey(key);
  }
}
