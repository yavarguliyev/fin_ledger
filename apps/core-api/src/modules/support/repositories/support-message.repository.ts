import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { ListMessagesDto } from '../dtos/input/list-messages.dto';
import { SUPPORT } from '../constants/chat/support.constant';
import { SUPPORT_SQL } from '../constants/chat/support-sql.constant';
import { SupportMessageDto } from '../dtos/message/support-message.dto';
import { CreateSupportMessageDto } from '../dtos/input/create-support-message.dto';
import { AddAttachmentMessageDto } from '../dtos/input/add-attachment-message.dto';
import { EditMessageRowDto } from '../dtos/input/edit-message-row.dto';
import { HideMessageDto } from '../dtos/input/hide-message.dto';
import { MessageRefDto } from '../dtos/input/message-ref.dto';
import { MESSAGE_SEARCH } from '../constants/chat/message-search.constant';
import { MessageHitResponseDto } from '../dtos/response/message-hit-response.dto';
import { SearchMessagesDto } from '../dtos/input/search-messages.dto';
import { SearchTermHelper } from '../helpers/search-term.helper';
import { SUPPORT_MESSAGE_SQL } from '../constants/chat/support-message-sql.constant';
import { SUPPORT_MESSAGE_COLUMNS } from '../constants/chat/support-message-columns.constant';

@Injectable()
export class SupportMessageRepository extends BaseExtendedRepository<SupportMessageDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: SUPPORT_MESSAGE_COLUMNS.TABLE, columnMappings: { ...SUPPORT_MESSAGE_COLUMNS.MAPPINGS } });
  }

  protected getSelectColumns (): string[] {
    return [...SUPPORT_MESSAGE_COLUMNS.SELECT];
  }

  async add (dto: CreateSupportMessageDto): Promise<SupportMessageDto | null> {
    return this.create({ data: dto });
  }

  async addAttachment (dto: AddAttachmentMessageDto): Promise<SupportMessageDto | null> {
    const { conversationId, senderUserId, kind, source, body, storageKey, fileName, mimeType, sizeBytes, durationSeconds } = dto;
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({
      sql: SUPPORT_MESSAGE_SQL.INSERT_ATTACHMENT,
      params: [conversationId, senderUserId, kind, source, body, storageKey, fileName, mimeType, sizeBytes, durationSeconds]
    });

    return result.rows[0] ?? null;
  }

  async edit ({ id, body, attachment }: EditMessageRowDto): Promise<SupportMessageDto | null> {
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({
      sql: SUPPORT_MESSAGE_SQL.EDIT,
      params: [id, body, attachment?.storageKey ?? null, attachment?.fileName ?? null, attachment?.mimeType ?? null, attachment?.sizeBytes ?? null, attachment?.kind ?? null]
    });

    return result.rows[0] ?? null;
  }

  async deleteForEveryone ({ messageId }: MessageRefDto): Promise<SupportMessageDto | null> {
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({ sql: SUPPORT_MESSAGE_SQL.DELETE_FOR_EVERYONE, params: [messageId] });
    return result.rows[0] ?? null;
  }

  async hideForUser ({ messageId, userId }: HideMessageDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_MESSAGE_SQL.HIDE_FOR_USER, params: [messageId, userId] });
  }

  async listThread ({ conversationId, actorId, limit, before }: ListMessagesDto): Promise<SupportMessageDto[]> {
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({
      sql: SUPPORT_SQL.LIST_MESSAGES,
      params: [conversationId, before ?? null, limit ?? SUPPORT.PAGE_SIZE, actorId]
    });

    return result.rows.reverse();
  }

  async search ({ conversationId, actorId, term }: SearchMessagesDto): Promise<MessageHitResponseDto[]> {
    const result = await this.service.getWriteConnection().query<MessageHitResponseDto>({
      sql: MESSAGE_SEARCH.SQL,
      params: [conversationId, SearchTermHelper.likePattern({ term }), actorId, MESSAGE_SEARCH.LIMIT]
    });

    return result.rows;
  }
}
