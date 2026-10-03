import { Injectable } from '@nestjs/common';
import { JwksHelper } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { JwksResponseDto } from '../../dtos/response/jwks-response.dto';
import { JWKS_ENDPOINT } from '../../constants/tokens/jwks.constant';

@Injectable()
export class GetJwksUseCase extends AuthBaseUseCase<void, JwksResponseDto> {
  execute (): Promise<JwksResponseDto> {
    return Promise.resolve(JwksHelper.keySet({ publicKey: this.configService.get<string>(JWKS_ENDPOINT.PUBLIC_KEY_CONFIG)! }));
  }
}
