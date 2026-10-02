import { FILE_DROP } from '../constants/file-drop.constant';
import { FileTransferDto } from '../interfaces/file-transfer.interface';

export class FileTransferHelper {
  static hasFiles ({ transfer }: FileTransferDto): boolean {
    return !!transfer && Array.from(transfer.types).includes(FILE_DROP.FILES_TYPE);
  }

  static files ({ transfer }: FileTransferDto): File[] {
    return Array.from(transfer?.files ?? []);
  }
}
