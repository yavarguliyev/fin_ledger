import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { FavouriteConversationDto } from '../dtos/input/favourite-conversation.dto';
import { MuteWindowDto } from '../dtos/input/mute-window.dto';
import { PinConversationDto } from '../dtos/input/pin-conversation.dto';
import { PinCountDto } from '../dtos/response/pin-count.dto';
import { PreferenceWriteDto } from '../dtos/input/preference-write.dto';
import { PreferencesResponseDto } from '../dtos/response/preferences-response.dto';
import { ReadConversationDto } from '../../support';
import { SUPPORT_PREFERENCES } from '../constants/support-preferences.constant';
import { SUPPORT_PREFERENCES_SQL } from '../constants/support-preferences-sql.constant';
import { ThemeConversationDto } from '../dtos/input/theme-conversation.dto';
import { ThemeResponseDto } from '../dtos/response/theme-response.dto';

@Injectable()
export class SupportPreferencesRepository extends BaseExtendedRepository<PreferencesResponseDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: SUPPORT_PREFERENCES.TABLE,
      columnMappings: { mutedUntil: 'muted_until', pinnedAt: 'pinned_at', favourite: 'favourite' }
    });
  }

  protected getSelectColumns (): string[] {
    return ['mutedUntil', 'pinnedAt', 'favourite'];
  }

  async mute ({ conversationId, userId, seconds }: MuteWindowDto): Promise<PreferencesResponseDto> {
    return this.write({ sql: SUPPORT_PREFERENCES_SQL.MUTE, params: [conversationId, userId, seconds] });
  }

  async pin ({ conversationId, userId, pinned }: PinConversationDto): Promise<PreferencesResponseDto> {
    return this.write({ sql: SUPPORT_PREFERENCES_SQL.PIN, params: [conversationId, userId, pinned] });
  }

  async favourite ({ conversationId, userId, favourite }: FavouriteConversationDto): Promise<PreferencesResponseDto> {
    return this.write({ sql: SUPPORT_PREFERENCES_SQL.FAVOURITE, params: [conversationId, userId, favourite] });
  }

  async setTheme ({ conversationId, theme }: ThemeConversationDto): Promise<ThemeResponseDto> {
    const result = await this.service.getWriteConnection().query<ThemeResponseDto>({ sql: SUPPORT_PREFERENCES_SQL.SET_THEME, params: [conversationId, theme] });
    return result.rows[0] ?? { theme };
  }

  async otherPins ({ conversationId, userId }: ReadConversationDto): Promise<number> {
    const result = await this.service.getWriteConnection().query<PinCountDto>({ sql: SUPPORT_PREFERENCES_SQL.OTHER_PINS, params: [conversationId, userId] });
    return result.rows[0]?.count ?? 0;
  }

  private async write ({ sql, params }: PreferenceWriteDto): Promise<PreferencesResponseDto> {
    const result = await this.service.getWriteConnection().query<PreferencesResponseDto>({ sql, params });
    return result.rows[0] as PreferencesResponseDto;
  }
}
