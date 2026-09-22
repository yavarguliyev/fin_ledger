import { BadRequestException } from '@nestjs/common';
import { CryptoHelper } from '@common/libs';

import { AUTH_TOKEN_CONSTANTS } from '../constants/tokens/auth-token.constant';
import { ClaimedAuthTokenDto } from '../dtos/token/claimed-auth-token.dto';
import { ClaimLinkTokenDto } from '../dtos/helper/claim-link-token.dto';
import { IssueLinkTokenDto } from '../dtos/helper/issue-link-token.dto';
import { LinkTokenDto } from '../dtos/helper/link-token.dto';

export class AuthTokenHelper {
  static async issue ({ authTokenRepository, userId, purpose }: IssueLinkTokenDto): Promise<string> {
    const token = CryptoHelper.randomToken({ bytes: AUTH_TOKEN_CONSTANTS.TOKEN_BYTES });
    const expiresAt = new Date(Date.now() + AUTH_TOKEN_CONSTANTS.TTL_SECONDS[purpose] * 1000).toISOString();

    await authTokenRepository.issue({ userId, purpose, tokenHash: AuthTokenHelper.hash({ token }), expiresAt });

    return token;
  }

  static async claim ({ authTokenRepository, token, purposes, adapter }: ClaimLinkTokenDto): Promise<ClaimedAuthTokenDto> {
    const claimed = await authTokenRepository.claim({ tokenHash: AuthTokenHelper.hash({ token }), purposes, ...(adapter && { adapter }) });
    if (!claimed) throw new BadRequestException('This link is invalid, has expired or has already been used');

    return claimed;
  }

  private static hash ({ token }: LinkTokenDto): string {
    return CryptoHelper.sha256({ value: token });
  }
}
