import { Injectable } from '@nestjs/common';
import { SupportMessageContract } from '@common/libs';

import { ListPinsUseCase } from '../use-cases/queries/list-pins.use-case';
import { MessagePinDto } from '../dtos/input/message-pin.dto';
import { PinMessageDto } from '../dtos/input/pin-message.dto';
import { PinMessageUseCase } from '../use-cases/commands/pin-message.use-case';
import { ReadConversationDto } from '../../support';
import { UnpinMessageUseCase } from '../use-cases/commands/unpin-message.use-case';

@Injectable()
export class SupportPinsService {
  constructor (
    private readonly listPinsUseCase: ListPinsUseCase,
    private readonly pinMessageUseCase: PinMessageUseCase,
    private readonly unpinMessageUseCase: UnpinMessageUseCase
  ) {}

  async list (dto: ReadConversationDto): Promise<SupportMessageContract[]> {
    return this.listPinsUseCase.execute(dto);
  }

  async pin (dto: PinMessageDto): Promise<SupportMessageContract[]> {
    return this.pinMessageUseCase.execute(dto);
  }

  async unpin (dto: MessagePinDto): Promise<SupportMessageContract[]> {
    return this.unpinMessageUseCase.execute(dto);
  }
}
