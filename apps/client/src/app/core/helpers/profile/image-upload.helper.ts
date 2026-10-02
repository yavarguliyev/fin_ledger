import { IMAGE_UPLOAD } from '../../constants/profile/image-upload.constant';
import { HttpRequestError } from '../../errors/http-request.error';
import { UploadErrorDto } from '../../interfaces/profile/upload-error.interface';
import { UploadOutcomeDto } from '../../interfaces/profile/upload-outcome.interface';
import { ErrorMessageHelper } from '../http/error-message.helper';

export class ImageUploadHelper {
  static messageFor ({ error, files }: UploadErrorDto): string {
    if (!(error instanceof HttpRequestError) || error.status !== IMAGE_UPLOAD.PAYLOAD_TOO_LARGE) {
      return ErrorMessageHelper.from({ error, fallback: IMAGE_UPLOAD.UPLOAD_FAILED });
    }

    const oversized = files.filter(file => file.size > IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES);
    if (oversized.length === 0) return IMAGE_UPLOAD.TOO_LARGE;

    const named = oversized
        .map(file => `${file.name}${IMAGE_UPLOAD.SIZE_OPEN}${(file.size / IMAGE_UPLOAD.BYTES_PER_MB)
        .toFixed(IMAGE_UPLOAD.SIZE_DECIMALS)}${IMAGE_UPLOAD.SIZE_UNIT}${IMAGE_UPLOAD.SIZE_CLOSE}`)
        .join(IMAGE_UPLOAD.LIST_SEPARATOR);
    
    return `${IMAGE_UPLOAD.TOO_LARGE_PREFIX}${named}${IMAGE_UPLOAD.TOO_LARGE_SUFFIX}`;
  }

  static partialMessage ({ uploaded, rejected }: UploadOutcomeDto): string | null {
    if (rejected.length === 0) return null;
    const total = uploaded + rejected.length;
    const reasons = rejected.map(({ fileName, reason }) => `${fileName}${IMAGE_UPLOAD.NAME_SEPARATOR}${reason}`).join(IMAGE_UPLOAD.REJECTION_SEPARATOR);
    return `${IMAGE_UPLOAD.PARTIAL_PREFIX}${uploaded}${IMAGE_UPLOAD.PARTIAL_OF}${total}${IMAGE_UPLOAD.PARTIAL_SUFFIX}${reasons}`;
  }
}
