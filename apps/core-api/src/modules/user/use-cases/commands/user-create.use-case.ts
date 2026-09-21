import { ConflictException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v7 as uuid } from 'uuid';
import { SessionHelper } from '@common/libs';

import { UserCreateDto } from '../../dtos/request/user-create.dto';
import { UserCreateResponseDto } from '../../dtos/response/user-create-response.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { EmailHelper } from '../../../email/helpers/email.helper';

@Injectable()
export class UserCreateUseCase extends UserBaseCase<UserCreateDto, UserCreateResponseDto> {
  async execute (dto: UserCreateDto): Promise<UserCreateResponseDto> {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const temporaryPassword = uuid();
    const passwordHash = await SessionHelper.hash({ password: temporaryPassword });

    const { email, displayName, role } = dto;

    const user = await this.userRepository.create({
      data: { email, displayName, role, passwordHash, passwordChangedAt: new Date().toISOString(), isEmailVerified: false }
    });
    if (!user) throw new ConflictException('Failed to create user');

    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const tokenPayload = { userId: user.id, email: user.email, displayName: user.displayName, role: user.role, purpose: 'email_verification' };
    const token = jwt.sign(tokenPayload, privateKey, { algorithm: 'RS256', expiresIn: '24h', ...(issuer && { issuer }) });
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    await EmailHelper.emitKafkaUserEmailVerification({
      subject: 'Verify Your Email - Complete Registration',
      purpose: 'Email Verification',
      title: `Welcome ${user.displayName}!`,
      body: `You have been invited as ${user.role}. Please verify your email`,
      action: 'email',
      url: verificationUrl,
      publishEmailVerification: this.publishEmailVerification.bind(this)
    });

    return { success: true, message: 'User created successfully. Verification email sent.', token };
  }
}
