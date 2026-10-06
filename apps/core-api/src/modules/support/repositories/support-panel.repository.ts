import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { CustomerStorageDto } from '../dtos/message/customer-storage.dto';
import { DeletedFileRowDto } from '../dtos/message/deleted-file-row.dto';
import { MessageLinkDto } from '../dtos/message/message-link.dto';
import { OwnFilesRefDto } from '../dtos/input/own-files-ref.dto';
import { PanelFilesFilterDto } from '../dtos/input/panel-files-filter.dto';
import { PanelPageFilterDto } from '../dtos/input/panel-page-filter.dto';
import { StarredFilterDto } from '../dtos/input/starred-filter.dto';
import { StorageFileDto } from '../dtos/message/storage-file.dto';
import { StorageTotalsDto } from '../dtos/message/storage-totals.dto';
import { SUPPORT_MESSAGE_COLUMNS } from '../constants/chat/support-message-columns.constant';
import { SUPPORT_PANEL } from '../constants/chat/support-panel.constant';
import { SUPPORT_PANEL_SQL } from '../constants/chat/support-panel-sql.constant';
import { SupportMessageDto } from '../dtos/message/support-message.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportPanelRepository extends BaseExtendedRepository<SupportMessageDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: SUPPORT_MESSAGE_COLUMNS.TABLE, columnMappings: { ...SUPPORT_MESSAGE_COLUMNS.MAPPINGS } });
  }

  protected getSelectColumns (): string[] {
    return [...SUPPORT_MESSAGE_COLUMNS.SELECT];
  }

  async files ({ conversationId, userId, kinds, limit, before, beforeId }: PanelFilesFilterDto): Promise<SupportMessageDto[]> {
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({
      sql: SUPPORT_PANEL_SQL.FILES,
      params: [conversationId, kinds, before ?? null, beforeId ?? null, limit, userId]
    });

    return result.rows;
  }

  async links ({ conversationId, userId, limit, before, beforeId }: PanelPageFilterDto): Promise<MessageLinkDto[]> {
    const result = await this.service.getWriteConnection().query<MessageLinkDto>({
      sql: SUPPORT_PANEL_SQL.LINKS,
      params: [conversationId, before ?? null, beforeId ?? null, limit, userId]
    });

    return result.rows;
  }

  async storageTotals ({ conversationId, userId }: StarredFilterDto): Promise<StorageTotalsDto | null> {
    const result = await this.service.getWriteConnection().query<StorageTotalsDto>({ sql: SUPPORT_PANEL_SQL.STORAGE_TOTALS, params: [conversationId, userId] });
    return result.rows[0] ?? null;
  }

  async storageFiles ({ conversationId, userId }: StarredFilterDto): Promise<StorageFileDto[]> {
    const result = await this.service.getWriteConnection().query<StorageFileDto>({
      sql: SUPPORT_PANEL_SQL.STORAGE_FILES,
      params: [conversationId, userId, SUPPORT_PANEL.STORAGE_LIST_LIMIT]
    });

    return result.rows;
  }

  async customerTotal ({ userId }: UserRefDto): Promise<CustomerStorageDto | null> {
    const result = await this.service.getWriteConnection().query<CustomerStorageDto>({ sql: SUPPORT_PANEL_SQL.CUSTOMER_TOTAL, params: [userId] });
    return result.rows[0] ?? null;
  }

  async deleteOwnFiles ({ conversationId, userId, messageIds }: OwnFilesRefDto): Promise<DeletedFileRowDto[]> {
    const result = await this.service.getWriteConnection().query<DeletedFileRowDto>({
      sql: SUPPORT_PANEL_SQL.DELETE_OWN_FILES,
      params: [conversationId, userId, messageIds]
    });

    return result.rows;
  }
}
