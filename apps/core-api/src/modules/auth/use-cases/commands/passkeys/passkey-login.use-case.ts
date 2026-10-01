import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, VerifyAuthenticationResponseOpts } from '@simplewebauthn/server';
import { RequestScope } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';
import { PasskeyChallengeService } from '../../../services/passkey-challenge.service';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { AuthHelper } from '../../../helpers/auth.helper';
import { PasskeyLoginOptionsDto } from '../../../dtos/passkeys/passkey-login-options.dto';
import { VerifyPasskeyLoginDto } from '../../../dtos/passkeys/verify-passkey-login.dto';
import { AuthResponseDto } from '../../../dtos/response/auth-response.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';
import { LOCKOUT } from '../../../constants/lockout/lockout.constant';

@Injectable()
export class PasskeyLoginUseCase extends AuthBaseUseCase<VerifyPasskeyLoginDto, AuthResponseDto> {
  private readonly logger = new Logger(PasskeyLoginUseCase.name);

  constructor (
    private readonly authRepository: AuthRepository,
    private readonly credentialRepository: UserCredentialRepository,
    private readonly challenges: PasskeyChallengeService
  ) {
    super();
  }

  async execute ({ owner, response }: VerifyPasskeyLoginDto): Promise<AuthResponseDto> {
    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const expectedChallenge = await this.challenges.take({ scope: PASSKEY.LOGIN_SCOPE, owner });

    const credential = await RequestScope.runSystem(() => this.credentialRepository.findByCredentialId({ credentialId: response.id }));
    if (!credential) throw new UnauthorizedException(PASSKEY.UNKNOWN_CREDENTIAL_MESSAGE);

    const verification = await PasskeyLoginUseCase.attempt({
      response: response as unknown as AuthenticationResponseJSON,
      expectedChallenge,
      expectedOrigin: party.origin,
      expectedRPID: party.id,
      credential: {
        id: credential.credentialId,
        publicKey: new Uint8Array(Buffer.from(credential.publicKey, 'base64url')),
        counter: Number(credential.signCount)
      }
    });

    if (!verification.verified) throw new UnauthorizedException(PASSKEY.NOT_VERIFIED_MESSAGE);

    const { newCounter } = verification.authenticationInfo;
    if (newCounter !== 0 && newCounter <= Number(credential.signCount)) {
      this.logger.error(`${PASSKEY.CLONED_MESSAGE}: credential ${credential.credentialId} for user ${credential.userId}`);
      throw new UnauthorizedException(PASSKEY.CLONED_MESSAGE);
    }

    await RequestScope.runSystem(() => this.credentialRepository.recordUsage({ id: credential.id, signCount: newCounter }));

    const user = await this.authRepository.findById({ id: credential.userId });
    if (!user || user.deletedAt) throw new UnauthorizedException(LOCKOUT.INVALID_CREDENTIALS);

    await this.authRepository.update({ id: user.id, data: { lastLoginAt: new Date().toISOString() } });

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      refreshToken: await this.refreshService.issue({ userId: user.id })
    });
  }

  async options ({ owner }: PasskeyLoginOptionsDto): Promise<unknown> {
    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const options = await generateAuthenticationOptions({ rpID: party.id, userVerification: PASSKEY.USER_VERIFICATION });
    await this.challenges.remember({ scope: PASSKEY.LOGIN_SCOPE, owner, challenge: options.challenge });
    return options;
  }

  private static async attempt (options: VerifyAuthenticationResponseOpts): ReturnType<typeof verifyAuthenticationResponse> {
    try {
      return await verifyAuthenticationResponse({ ...options, requireUserVerification: false });
    } catch {
      throw new UnauthorizedException(PASSKEY.NOT_VERIFIED_MESSAGE);
    }
  }
}
