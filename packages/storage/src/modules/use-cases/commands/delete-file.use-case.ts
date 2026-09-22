import { Injectable } from '@nestjs/common';

import { StorageBaseUseCase } from '../base/storage-base.use-case';
import { DeleteResult } from '../../interfaces/delete-result.interface';
import { ObjectKeyDto } from '../../dtos/strategy/object-key.dto';
import { FileSelectionDto } from '../../dtos/service/file-selection.dto';

@Injectable()
export class DeleteFileUseCase extends StorageBaseUseCase {
  async execute (dto: ObjectKeyDto): Promise<DeleteResult> {
    await this.ensureExists(dto);
    await this.storageStrategy.delete(dto);
    return { message: 'File deleted successfully' };
  }

  async deleteWithLogic (dto: FileSelectionDto): Promise<DeleteResult> {
    const { key, indexes } = dto;
    if (indexes && indexes.length > 0) return this.executeByKey(dto);
    if (await this.isSingleFile({ key })) return this.execute({ key });
    return this.executeByKey({ key });
  }

  protected async executeByKey ({ key, indexes }: FileSelectionDto): Promise<DeleteResult> {
    const { files, targetFiles } = await this.resolveTargetFiles({ key, indexes });
    await Promise.all(targetFiles.map(filePath => this.storageStrategy.delete({ key: filePath })));

    const count = indexes?.length ?? files.length;
    return { message: indexes ? `Deleted ${count} file(s)` : 'Deleted all files' };
  }
}
