import { ObjectKeyDto } from '../../dtos/strategy/object-key.dto';
import { ObjectPrefixDto } from '../../dtos/strategy/object-prefix.dto';
import { UploadObjectDto } from '../../dtos/strategy/upload-object.dto';
import { DownloadUrlDto } from '../../dtos/strategy/download-url.dto';

export abstract class BaseStrategy {
  abstract upload(dto: UploadObjectDto): Promise<void>;
  abstract getDownloadUrl(dto: DownloadUrlDto): Promise<string>;
  abstract delete(dto: ObjectKeyDto): Promise<void>;
  abstract exists(dto: ObjectKeyDto): Promise<boolean>;
  abstract listByPrefix(dto: ObjectPrefixDto): Promise<string[]>;
}
