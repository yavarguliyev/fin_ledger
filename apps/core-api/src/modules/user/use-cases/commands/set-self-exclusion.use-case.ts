import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailTemplateType } from '@common/libs';

import { UserBaseCase } from '../base/user-base.use-case';
import { SetSelfExclusionDto } from '../../dtos/input/set-self-exclusion.dto';
import { SelfExclusionResponseDto } from '../../dtos/response/self-exclusion-response.dto';
import { SelfExclusionHelper } from '../../helpers/self-exclusion.helper';
import { SELF_EXCLUSION } from '../../constants/self-exclusion/self-exclusion.constant';
import { USER_STATUS_ERRORS } from '../../constants/errors/user-status-errors.constant';
import { FRONTEND } from '../../../../shared/constants/config/frontend.constant';

@Injectable()
export class SetSelfExclusionUseCase extends UserBaseCase<SetSelfExclusionDto, SelfExclusionResponseDto> {
  async execute ({ userId, period }: SetSelfExclusionDto): Promise<SelfExclusionResponseDto> {
    const user = await this.userRepository.findById({ id: userId });
    if (!user) throw new NotFoundException(USER_STATUS_ERRORS.NOT_FOUND);

    const requested = SelfExclusionHelper.until({ period });
    const current = user.selfExclusionUntil;

    if (current && new Date(current).getTime() >= new Date(requested).getTime()) {
      throw new BadRequestException(SELF_EXCLUSION.ALREADY_LONGER_MESSAGE);
    }

    await this.userRepository.updateUser({ userId, updates: { selfExclusionUntil: requested } });

    await this.publishAccountEmail({
      eventType: EmailTemplateType.SELF_EXCLUSION_STARTED,
      userId,
      eventPayload: {
        to: user.email,
        subject: SELF_EXCLUSION.EMAIL.SUBJECT,
        purpose: SELF_EXCLUSION.EMAIL.PURPOSE,
        title: SELF_EXCLUSION.EMAIL.TITLE,
        body: SELF_EXCLUSION.EMAIL.BODY,
        url: `${this.configService.get<string>(FRONTEND.URL_KEY)}${SELF_EXCLUSION.PROFILE_PATH}`
      }
    });

    return { status: true, message: SELF_EXCLUSION.STARTED_MESSAGE, selfExclusionUntil: requested };
  }
}
