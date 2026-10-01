import { Injectable, UnauthorizedException } from '@nestjs/common';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, VerifyAuthenticationResponseOpts } from '@simplewebauthn/server';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';
import { PasskeyChallengeService } from '../../../services/passkey-challenge.service';
import { PasskeyStepUpService } from '../../../services/passkey-step-up.service';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';
import { VerifyStepUpDto } from '../../../dtos/passkeys/verify-step-up.dto';
import { AccountMessageResponseDto } from '../../../dtos/response/account-message-response.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class PasskeyStepUpUseCase extends AuthBaseUseCase<VerifyStepUpDto, AccountMessageResponseDto> {
  constructor (
    private readonly credentialRepository: UserCredentialRepository,
    private readonly challenges: PasskeyChallengeService,
    private readonly stepUp: PasskeyStepUpService
  ) {
    super();
  }

  async execute ({ userId, response }: VerifyStepUpDto): Promise<AccountMessageResponseDto> {
    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const expectedChallenge = await this.challenges.take({ scope: PASSKEY.STEP_UP_SCOPE, owner: userId });

    const credential = await this.credentialRepository.findByCredentialId({ credentialId: response.id });
    if (!credential || credential.userId !== userId) throw new UnauthorizedException(PASSKEY.UNKNOWN_CREDENTIAL_MESSAGE);

    const verification = await PasskeyStepUpUseCase.attempt({
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

    await this.credentialRepository.recordUsage({ id: credential.id, signCount: verification.authenticationInfo.newCounter });
    await this.stepUp.grant({ userId });

    return { status: true, message: PASSKEY.STEP_UP_CONFIRMED_MESSAGE };
  }

  async options ({ userId }: PasskeyOwnerDto): Promise<unknown> {
    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const credentials = await this.credentialRepository.findForUser({ userId });

    const options = await generateAuthenticationOptions({
      rpID: party.id,
      userVerification: PASSKEY.USER_VERIFICATION,
      allowCredentials: PasskeyHelper.allowed({ credentials })
    });

    await this.challenges.remember({ scope: PASSKEY.STEP_UP_SCOPE, owner: userId, challenge: options.challenge });

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
