import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { v7 as uuid } from 'uuid';
import { KAFKA_SERVICE, KafkaService, PasswordHandler, SessionService, StorageService } from '@common/libs';

import { UserCreateDto, UserCreateResponse } from '../../dtos/user/user-create.dto';
import { UserBaseCase } from '../base/user-base.use-case';
import { UserRepository } from '../../repositories/user.repository';
import { emitKafkaUserEmailVerification } from '../../../email/helpers/user/emit-kafka-email-event.helper';
import { ConvertWalletCurrencyUseCase } from '../../../wallet-currency-conversion/use-cases/commands/convert-wallet-currency.use-case';

@Injectable()
export class UserCreateUseCase extends UserBaseCase<UserCreateDto, UserCreateResponse> {
  constructor (
    protected override readonly storageService: StorageService,
    protected override readonly userRepository: UserRepository,
    protected override readonly sessionService: SessionService,
    protected override readonly configService: ConfigService,
    protected override readonly convertWalletCurrencyUseCase: ConvertWalletCurrencyUseCase,
    protected override readonly passwordHelper: PasswordHandler,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    super(storageService, userRepository, sessionService, configService, convertWalletCurrencyUseCase, passwordHelper, kafkaService);
  }

  async execute (dto: UserCreateDto): Promise<UserCreateResponse> {
    const existingUser = await this.userRepository.findOne({ email: dto.email });
    if (existingUser) throw new ConflictException('Email already exists');

    const temporaryPassword = uuid();
    const passwordHash = await this.passwordHelper.hash(temporaryPassword);

    const { email, displayName, role } = dto;

    const user = await this.userRepository.create({ email, displayName, role, passwordHash, isEmailVerified: false });
    if (!user) throw new ConflictException('Failed to create user');

    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const tokenPayload = { userId: user.id, email: user.email, displayName: user.displayName, role: user.role, purpose: 'email_verification' };
    const token = jwt.sign(tokenPayload, privateKey, { algorithm: 'RS256', expiresIn: '24h', ...(issuer && { issuer }) });
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    await emitKafkaUserEmailVerification({
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
