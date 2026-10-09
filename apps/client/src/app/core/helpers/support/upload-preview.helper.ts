import { PENDING_UPLOAD } from '../../constants/support/pending-upload.constant';
import { PendingUploadFile } from '../../interfaces/support/pending-upload-file.interface';
import { PendingUploadRefDto } from '../../interfaces/support/pending-upload-ref.interface';
import { UploadFilesDto } from '../../interfaces/support/upload-files.interface';

export class UploadPreviewHelper {
  static fromFiles ({ files }: UploadFilesDto): PendingUploadFile[] {
    return files.map(file => {
      const kind = UploadPreviewHelper.kindOf({ files: [file] });
      return { name: file.name, kind, sizeBytes: file.size, objectUrl: kind === PENDING_UPLOAD.KINDS.FILE ? null : URL.createObjectURL(file) };
    });
  }

  static release ({ upload }: PendingUploadRefDto): void {
    upload.files.forEach(file => {
      if (file.objectUrl) URL.revokeObjectURL(file.objectUrl);
    });
  }

  private static kindOf ({ files }: UploadFilesDto): string {
    const type = files[0]?.type ?? '';
    if (type.startsWith(PENDING_UPLOAD.IMAGE_PREFIX)) return PENDING_UPLOAD.KINDS.IMAGE;
    return type.startsWith(PENDING_UPLOAD.VIDEO_PREFIX) ? PENDING_UPLOAD.KINDS.VIDEO : PENDING_UPLOAD.KINDS.FILE;
  }
}
