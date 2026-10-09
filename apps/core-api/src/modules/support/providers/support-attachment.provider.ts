import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { BaseStrategy, CONTENT_DISPOSITION, CryptoHelper, SupportMessageContract } from '@common/libs';

import { AttachmentSignatureHelper } from '../helpers/attachment-signature.helper';
import { MessageRowRefDto } from '../dtos/message/message-row-ref.dto';
import { MessageRowsRefDto } from '../dtos/attachment/message-rows-ref.dto';
import { StorageKeyRefDto } from '../dtos/attachment/storage-key-ref.dto';
import { AvatarKeyRefDto } from '../dtos/attachment/avatar-key-ref.dto';
import { ConversationAvatarsDto } from '../dtos/conversation/conversation-avatars.dto';
import { ConversationRowRefDto } from '../dtos/conversation/conversation-row-ref.dto';
import { StoreAttachmentDto } from '../dtos/attachment/store-attachment.dto';
import { StoredAttachmentDto } from '../dtos/attachment/stored-attachment.dto';
import { SUPPORT_ATTACHMENT } from '../constants/attachment/support-attachment.constant';
import { SupportMapperHelper } from '../helpers/support-mapper.helper';
import { UploadFilesRefDto } from '../dtos/attachment/upload-files-ref.dto';
import { DownloadFileDto } from '../dtos/attachment/download-file.dto';
import { SUPPORT_PRIVACY } from '../constants/chat/support-privacy.constant';

@Injectable()
export class SupportAttachmentProvider {
  constructor (private readonly storage: BaseStrategy) {}

  assertAllowed ({ files }: UploadFilesRefDto): void {
    if (files.some(file => !AttachmentSignatureHelper.typeOf({ file })))
      throw new UnsupportedMediaTypeException(SUPPORT_ATTACHMENT.INVALID_TYPE_MESSAGE);
  }

  async store ({ conversationId, file }: StoreAttachmentDto): Promise<StoredAttachmentDto> {
    const type = AttachmentSignatureHelper.typeOf({ file });
    if (!type) throw new UnsupportedMediaTypeException(SUPPORT_ATTACHMENT.INVALID_TYPE_MESSAGE);

    const storageKey = [SUPPORT_ATTACHMENT.KEY_PREFIX, conversationId, CryptoHelper.uuid()].join(SUPPORT_ATTACHMENT.KEY_SEPARATOR);
    await this.storage.upload({ key: storageKey, body: file.buffer, contentType: type.mime });

    return {
      storageKey,
      fileName: AttachmentSignatureHelper.safeName({ file }),
      mimeType: type.mime,
      sizeBytes: file.buffer.length,
      kind: type.kind
    };
  }

  async toContract ({ row }: MessageRowRefDto): Promise<SupportMessageContract> {
    const message = SupportMapperHelper.toMessage({ row });
    if (!row.storageKey || row.deletedAt) return message;

    const url = await this.inlineUrl({ storageKey: row.storageKey });
    const attachment = {
      url,
      fileName: row.fileName,
      mimeType: row.mimeType ?? '',
      sizeBytes: row.sizeBytes ?? 0,
      durationSeconds: row.durationSeconds
    };

    return { ...message, attachment };
  }

  async toContracts ({ rows }: MessageRowsRefDto): Promise<SupportMessageContract[]> {
    return Promise.all(rows.map(row => this.toContract({ row })));
  }

  async downloadUrl ({ storageKey, fileName }: DownloadFileDto): Promise<string> {
    return this.storage.getDownloadUrl({
      key: storageKey,
      expiresIn: SUPPORT_PRIVACY.DOWNLOAD_TTL_SECONDS,
      contentDisposition: { disposition: CONTENT_DISPOSITION.ATTACHMENT, fileName }
    });
  }

  async inlineUrl ({ storageKey }: StorageKeyRefDto): Promise<string> {
    return this.storage.getDownloadUrl({
      key: storageKey,
      expiresIn: SUPPORT_ATTACHMENT.URL_TTL_SECONDS,
      contentDisposition: { disposition: CONTENT_DISPOSITION.INLINE }
    });
  }

  async avatarUrl ({ storageKey }: AvatarKeyRefDto): Promise<string | null> {
    return storageKey ? this.inlineUrl({ storageKey }) : null;
  }

  async conversationAvatars ({ row }: ConversationRowRefDto): Promise<ConversationAvatarsDto> {
    const [customerAvatarUrl, assignedStaffAvatarUrl] = await Promise.all([
      this.avatarUrl({ storageKey: row.customerAvatarKey }),
      this.avatarUrl({ storageKey: row.assignedStaffAvatarKey })
    ]);
    return { customerAvatarUrl, assignedStaffAvatarUrl };
  }

  async remove ({ storageKey }: StorageKeyRefDto): Promise<void> {
    await this.storage.delete({ key: storageKey }).catch(() => undefined);
  }
}
