import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { toDataURL } from 'qrcode';
import { CRYPTO_DEFAULTS, CryptoHelper, ServiceClientDto } from '@common/shared-libs';

import { TOTP_OPTIONS } from '../constants/totp/totp-options.constant';
import { BuildEnrollmentDto } from '../dtos/totp/build-enrollment.dto';
import { TotpEnrollmentDto } from '../dtos/totp/totp-enrollment.dto';
import { VerifyTotpDto } from '../dtos/totp/verify-totp.dto';
import { TotpVerificationDto } from '../dtos/totp/totp-verification.dto';
import { SecretValueDto } from '../dtos/cipher/secret-value.dto';
import { EncryptedSecretDto } from '../dtos/cipher/encrypted-secret.dto';

@Injectable()
export class TotpService {
  private static readonly CODE_PATTERN = /^\d{6}$/;

  private readonly configService: ConfigService;
  private readonly encryptionKey: Buffer;
  private readonly issuer: string;

  constructor ({ configService }: ServiceClientDto) {
    this.configService = configService;
    this.encryptionKey = Buffer.from(this.configService.get<string>('MFA_ENCRYPTION_KEY') ?? '', 'base64');
    this.issuer = this.configService.get<string>('MFA_ISSUER') ?? TOTP_OPTIONS.DEFAULT_ISSUER;

    if (this.encryptionKey.length !== CRYPTO_DEFAULTS.CIPHER_KEY_BYTES) {
      throw new InternalServerErrorException(`MFA_ENCRYPTION_KEY must be ${CRYPTO_DEFAULTS.CIPHER_KEY_BYTES} random bytes, base64-encoded`);
    }
  }

  createSecret (): string {
    return generateSecret();
  }

  async buildEnrollment ({ secret, accountName }: BuildEnrollmentDto): Promise<TotpEnrollmentDto> {
    const otpauthUri = generateURI({ issuer: this.issuer, label: accountName, secret });
    return { otpauthUri, qrCodeDataUrl: await toDataURL(otpauthUri) };
  }

  verify ({ secret, code, lastUsedStep }: VerifyTotpDto): TotpVerificationDto {
    const token = code.replace(/\s/g, '');
    if (!TotpService.CODE_PATTERN.test(token)) return { valid: false };

    const result = verifySync({ secret, token, epochTolerance: TOTP_OPTIONS.EPOCH_TOLERANCE_SECONDS });
    if (!result.valid || !('timeStep' in result)) return { valid: false };
    if (lastUsedStep !== null && result.timeStep <= lastUsedStep) return { valid: false };

    return { valid: true, timeStep: result.timeStep };
  }

  encryptSecret ({ secret }: SecretValueDto): Buffer {
    return CryptoHelper.encrypt({ plaintext: secret, key: this.encryptionKey });
  }

  decryptSecret ({ encrypted }: EncryptedSecretDto): string {
    return CryptoHelper.decrypt({ encrypted, key: this.encryptionKey });
  }
}
