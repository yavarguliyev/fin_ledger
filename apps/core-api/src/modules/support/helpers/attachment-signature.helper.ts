import { AttachmentType } from '../interfaces/attachment-type.interface';
import { SignatureMatchDto } from '../dtos/attachment/signature-match.dto';
import { SUPPORT_ATTACHMENT } from '../constants/attachment/support-attachment.constant';
import { SUPPORT_ATTACHMENT_TYPES } from '../constants/attachment/support-attachment-types.constant';
import { UploadFileRefDto } from '../dtos/attachment/upload-file-ref.dto';

export class AttachmentSignatureHelper {
  static typeOf ({ file }: UploadFileRefDto): AttachmentType | null {
    const mime = file.mimetype.split(SUPPORT_ATTACHMENT.MIME_PARAMS_SEPARATOR)[0]?.trim().toLowerCase();
    const type = SUPPORT_ATTACHMENT_TYPES.find(candidate => candidate.mime === mime);
    if (!type || file.buffer.length === 0) return null;
    return AttachmentSignatureHelper.matches({ type, buffer: file.buffer }) ? type : null;
  }

  static safeName ({ file }: UploadFileRefDto): string {
    const unsafe = (char: string): boolean =>
      char.charCodeAt(0) < SUPPORT_ATTACHMENT.CONTROL_CHAR_LIMIT || SUPPORT_ATTACHMENT.UNSAFE_PATH_CHARS.includes(char);

    return [...file.originalname]
      .map(char => (unsafe(char) ? SUPPORT_ATTACHMENT.SAFE_REPLACEMENT : char))
      .join('')
      .slice(0, SUPPORT_ATTACHMENT.FILE_NAME_MAX_LENGTH);
  }

  private static matches ({ type, buffer }: SignatureMatchDto): boolean {
    if (type.signature.length === 0) return !buffer.subarray(0, SUPPORT_ATTACHMENT.TEXT_SNIFF_BYTES).includes(SUPPORT_ATTACHMENT.NUL_BYTE);
    return type.signature.every(({ offset, bytes }) => bytes.every((byte, index) => buffer[offset + index] === byte));
  }
}
