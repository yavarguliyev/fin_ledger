import { Inject, NotFoundException } from '@nestjs/common';
import { StorageType } from '@common/shared-libs';

import { BaseStrategy } from '../../strategies/base/base.strategy';
import { ObjectKeyDto } from '../../dtos/strategy/object-key.dto';
import { FilenameDto } from '../../dtos/step/filename.dto';
import { FilterFilesDto } from '../../dtos/step/filter-files.dto';
import { FileSelectionDto } from '../../dtos/service/file-selection.dto';
import { TargetFilesDto } from '../../dtos/step/target-files.dto';

export abstract class StorageBaseUseCase {
  protected abstract readonly storageType: StorageType;

  @Inject(BaseStrategy)
  protected readonly storageStrategy!: BaseStrategy;

  protected async checkExists (dto: ObjectKeyDto): Promise<boolean> {
    return this.storageStrategy.exists(dto);
  }

  protected getFileExtension ({ filename }: FilenameDto): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }

  protected async ensureExists (dto: ObjectKeyDto): Promise<void> {
    const exists = await this.storageStrategy.exists(dto);
    if (!exists) throw new NotFoundException('File not found');
  }

  protected async getFilesWithPrefix ({ key }: ObjectKeyDto): Promise<string[]> {
    const files = await this.storageStrategy.listByPrefix({ prefix: key });
    if (files.length === 0) throw new NotFoundException(`No files found for key: ${key}`);
    return files;
  }

  protected filterFilesByIndexes ({ files, indexes }: FilterFilesDto): string[] {
    if (!indexes || indexes.length === 0) return files;

    const filtered = indexes
      .filter(idx => idx >= 0 && idx < files.length)
      .map(idx => files[idx])
      .filter((file): file is string => file !== undefined);

    if (filtered.length === 0) throw new NotFoundException(`Invalid indexes provided`);
    return filtered;
  }

  protected async resolveTargetFiles ({ key, indexes }: FileSelectionDto): Promise<TargetFilesDto> {
    const files = await this.getFilesWithPrefix({ key });
    return { files, targetFiles: this.filterFilesByIndexes({ files, indexes }) };
  }

  protected async isSingleFile ({ key }: ObjectKeyDto): Promise<boolean> {
    const files = await this.storageStrategy.listByPrefix({ prefix: key });
    return files.length === 0 || (files.length === 1 && files[0] === key);
  }
}
