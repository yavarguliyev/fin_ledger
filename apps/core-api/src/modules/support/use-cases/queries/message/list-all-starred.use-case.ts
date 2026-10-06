import { Injectable } from '@nestjs/common';

import { StarredMessageDto } from '../../../dtos/message/starred-message.dto';
import { SupportStarRepository } from '../../../repositories/support-star.repository';
import { UserRefDto } from '../../../dtos/input/user-ref.dto';

@Injectable()
export class ListAllStarredUseCase {
  constructor (private readonly starRepository: SupportStarRepository) {}

  async execute ({ userId }: UserRefDto): Promise<StarredMessageDto[]> {
    return this.starRepository.listAll({ userId });
  }
}
