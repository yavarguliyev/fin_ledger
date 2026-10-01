import { ByteSizeDto } from '../../dtos/support/byte-size.dto';
import { FilesRefDto } from '../../dtos/support/files-ref.dto';
import { SUPPORT_ATTACHMENT } from '../../constants/support/support-attachment.constant';

export class SupportAttachmentHelper {
  static problemWith ({ files }: FilesRefDto): string | null {
    const allowed = SUPPORT_ATTACHMENT.ACCEPT.split(SUPPORT_ATTACHMENT.ACCEPT_SEPARATOR);

    if (files.length > SUPPORT_ATTACHMENT.MAX_FILES) return SUPPORT_ATTACHMENT.TOO_MANY_FILES;
    if (files.some(file => file.size > SUPPORT_ATTACHMENT.MAX_FILE_SIZE_BYTES)) return SUPPORT_ATTACHMENT.TOO_LARGE;
    if (files.some(file => !allowed.includes(file.type.split(SUPPORT_ATTACHMENT.MIME_PARAMS_SEPARATOR)[0] ?? ''))) return SUPPORT_ATTACHMENT.WRONG_TYPE;

    return null;
  }

  static formatSize ({ bytes }: ByteSizeDto): string {
    const units = SUPPORT_ATTACHMENT.SIZE_UNITS;
    let value = bytes;
    let unit = 0;

    while (value >= SUPPORT_ATTACHMENT.BYTES_PER_KB && unit < units.length - 1) {
      value /= SUPPORT_ATTACHMENT.BYTES_PER_KB;
      unit += 1;
    }

    return `${unit === 0 ? value : value.toFixed(SUPPORT_ATTACHMENT.SIZE_DECIMALS)} ${units[unit]}`;
  }
}
