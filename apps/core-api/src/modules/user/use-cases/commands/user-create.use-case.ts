import { ConflictException, Injectable } from '@nestjs/common';
import { AuthTokenPurpose, CryptoHelper, SessionHelper } from '@common/libs';

import { UserCreateDto } from '../../dtos/request/user-create.dto';
import { UserCreateResponseDto } from '../../dtos/response/user-create-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { EmailHelper } from '../../../email/helpers/email.helper';
import { AuthTokenRepository } from '../../../auth/repositories/auth-token.repository';
import { AuthTokenHelper } from '../../../auth/helpers/auth-token.helper';

@Injectable()
export class UserCreateUseCase extends UserBaseCase<UserCreateDto, UserCreateResponseDto> {
  constructor (private readonly authTokenRepository: AuthTokenRepository) {
    super();
  }

  async execute (dto: UserCreateDto): Promise<UserCreateResponseDto> {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const temporaryPassword = CryptoHelper.randomToken({ bytes: 32 });
    const passwordHash = await SessionHelper.hash({ password: temporaryPassword });

    const { email, displayName, role } = dto;

    const user = await this.userRepository.create({
      data: { email, displayName, role, passwordHash, passwordChangedAt: new Date().toISOString(), isEmailVerified: false }
    });
    if (!user) throw new ConflictException('Failed to create user');

    const token = await AuthTokenHelper.issue({ authTokenRepository: this.authTokenRepository, userId: user.id, purpose: AuthTokenPurpose.ACCOUNT_INVITE });
    const invitationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/set-password?token=${token}`;

    await EmailHelper.emitKafkaUserEmailVerification({
      to: user.email,
      subject: 'Verify Your Email - Complete Registration',
      purpose: 'Email Verification',
      title: `Welcome ${user.displayName}!`,
      body: `You have been invited as ${user.role}. Please verify your email`,
      action: 'email',
      url: invitationUrl,
      publishEmailVerification: this.publishEmailVerification.bind(this)
    });

    return { success: true, message: 'User created successfully. Verification email sent.' };
  }
}
