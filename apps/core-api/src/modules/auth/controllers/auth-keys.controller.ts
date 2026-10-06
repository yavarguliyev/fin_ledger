import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { JwksResponseDto } from '../dtos/response/jwks-response.dto';
import { JWKS_ENDPOINT } from '../constants/tokens/jwks.constant';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: JWKS_ENDPOINT.CONTROLLER_PATH, version: VERSION_NEUTRAL })
export class AuthKeysController {
  constructor (private readonly authService: AuthService) {}

  @Get(JWKS_ENDPOINT.JWKS_PATH)
  async getJwks (): Promise<JwksResponseDto> {
    return this.authService.getJwks();
  }
}
