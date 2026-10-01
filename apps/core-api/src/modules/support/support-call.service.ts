import { Injectable } from '@nestjs/common';

import { AnswerCallDto } from './dtos/input/answer-call.dto';
import { AnswerCallUseCase } from './use-cases/commands/call/answer-call.use-case';
import { CallConfigResponseDto } from './dtos/response/call-config-response.dto';
import { EndCallDto } from './dtos/input/end-call.dto';
import { EndCallUseCase } from './use-cases/commands/call/end-call.use-case';
import { GetCallConfigUseCase } from './use-cases/queries/call/get-call-config.use-case';
import { OkResponseDto } from './dtos/response/ok-response.dto';
import { RelayCallCandidateUseCase } from './use-cases/commands/call/relay-call-candidate.use-case';
import { RelayCandidateDto } from './dtos/input/relay-candidate.dto';
import { StartCallDto } from './dtos/input/start-call.dto';
import { StartCallResponseDto } from './dtos/response/start-call-response.dto';
import { StartCallUseCase } from './use-cases/commands/call/start-call.use-case';

@Injectable()
export class SupportCallService {
  constructor (
    private readonly getCallConfigUseCase: GetCallConfigUseCase,
    private readonly startCallUseCase: StartCallUseCase,
    private readonly answerCallUseCase: AnswerCallUseCase,
    private readonly relayCallCandidateUseCase: RelayCallCandidateUseCase,
    private readonly endCallUseCase: EndCallUseCase
  ) {}

  getCallConfig (): CallConfigResponseDto {
    return this.getCallConfigUseCase.execute();
  }

  async startCall (dto: StartCallDto): Promise<StartCallResponseDto> {
    return this.startCallUseCase.execute(dto);
  }

  async answerCall (dto: AnswerCallDto): Promise<OkResponseDto> {
    return this.answerCallUseCase.execute(dto);
  }

  async relayCallCandidate (dto: RelayCandidateDto): Promise<OkResponseDto> {
    return this.relayCallCandidateUseCase.execute(dto);
  }

  async endCall (dto: EndCallDto): Promise<OkResponseDto> {
    return this.endCallUseCase.execute(dto);
  }
}
