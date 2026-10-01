import { BadRequestException, Injectable } from '@nestjs/common';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON, VerifyRegistrationResponseOpts } from '@simplewebauthn/server';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { UserCredentialRepository } from '../../../repositories/user-credential.repository';
import { PasskeyChallengeService } from '../../../services/passkey-challenge.service';
import { PasskeyHelper } from '../../../helpers/passkey.helper';
import { PasskeyOwnerDto } from '../../../dtos/passkeys/passkey-owner.dto';
import { VerifyRegistrationDto } from '../../../dtos/passkeys/verify-registration.dto';
import { PasskeyRegisteredDto } from '../../../dtos/passkeys/passkey-registered.dto';
import { PASSKEY } from '../../../constants/passkeys/passkey.constant';

@Injectable()
export class PasskeyRegistrationUseCase extends AuthBaseUseCase<PasskeyOwnerDto, unknown> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly credentialRepository: UserCredentialRepository,
    private readonly challenges: PasskeyChallengeService
  ) {
    super();
  }

  async execute ({ userId }: PasskeyOwnerDto): Promise<unknown> {
    const user = await this.authRepository.findById({ id: userId });
    if (!user) throw new BadRequestException(PASSKEY.NOT_FOUND_MESSAGE);

    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const credentials = await this.credentialRepository.findForUser({ userId });

    const options = await generateRegistrationOptions({
      rpName: party.name,
      rpID: party.id,
      userName: user.email,
      userDisplayName: user.displayName,
      attestationType: PASSKEY.ATTESTATION,
      excludeCredentials: PasskeyHelper.allowed({ credentials }),
      authenticatorSelection: {
        residentKey: PASSKEY.RESIDENT_KEY,
        requireResidentKey: true,
        userVerification: PASSKEY.USER_VERIFICATION
      }
    });

    await this.challenges.remember({ scope: PASSKEY.REGISTER_SCOPE, owner: userId, challenge: options.challenge });

    return options;
  }

  async verify ({ userId, response, deviceLabel }: VerifyRegistrationDto): Promise<PasskeyRegisteredDto> {
    const party = PasskeyHelper.relyingParty({ configService: this.configService });
    const expectedChallenge = await this.challenges.take({ scope: PASSKEY.REGISTER_SCOPE, owner: userId });

    const verification = await PasskeyRegistrationUseCase.attempt({
      response: response as unknown as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: party.origin,
      expectedRPID: party.id
    });

    if (!verification.verified || !verification.registrationInfo) throw new BadRequestException(PASSKEY.NOT_VERIFIED_MESSAGE);

    const { credential, credentialBackedUp } = verification.registrationInfo;

    await this.credentialRepository.save({
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      signCount: credential.counter,
      transports: credential.transports ?? [],
      backedUp: credentialBackedUp,
      ...(deviceLabel && { deviceLabel })
    });

    return { verified: true, credentialId: credential.id };
  }

  private static async attempt (options: VerifyRegistrationResponseOpts): ReturnType<typeof verifyRegistrationResponse> {
    try {
      return await verifyRegistrationResponse({ ...options, requireUserVerification: false });
    } catch {
      throw new BadRequestException(PASSKEY.NOT_VERIFIED_MESSAGE);
    }
  }
}
