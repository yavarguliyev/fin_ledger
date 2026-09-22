import * as crypto from 'node:crypto';
import { v7 as uuid } from 'uuid';

import { CRYPTO_DEFAULTS } from '../constants/crypto/crypto-defaults.constant';
import { DecryptValueDto } from '../dtos/crypto/decrypt-value.dto';
import { EncryptValueDto } from '../dtos/crypto/encrypt-value.dto';
import { HashValueDto } from '../dtos/crypto/hash-value.dto';
import { RandomBytesDto } from '../dtos/crypto/random-bytes.dto';
import { RsaKeyPairDto } from '../dtos/crypto/rsa-key-pair.dto';

export class CryptoHelper {
  static randomBytes ({ bytes }: RandomBytesDto): Buffer {
    return crypto.randomBytes(bytes);
  }

  static randomToken ({ bytes }: RandomBytesDto): string {
    return crypto.randomBytes(bytes).toString('base64url');
  }

  static uuid (): string {
    return uuid();
  }

  static sha256 ({ value }: HashValueDto): string {
    return crypto.createHash(CRYPTO_DEFAULTS.HASH_ALGORITHM).update(value).digest('hex');
  }

  static encrypt ({ plaintext, key }: EncryptValueDto): Buffer {
    const iv = crypto.randomBytes(CRYPTO_DEFAULTS.CIPHER_IV_BYTES);
    const cipher = crypto.createCipheriv(CRYPTO_DEFAULTS.CIPHER_ALGORITHM, key, iv, { authTagLength: CRYPTO_DEFAULTS.CIPHER_TAG_BYTES });
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  }

  static decrypt ({ encrypted, key }: DecryptValueDto): string {
    const { CIPHER_ALGORITHM, CIPHER_IV_BYTES, CIPHER_TAG_BYTES } = CRYPTO_DEFAULTS;
    const iv = encrypted.subarray(0, CIPHER_IV_BYTES);
    const tag = encrypted.subarray(CIPHER_IV_BYTES, CIPHER_IV_BYTES + CIPHER_TAG_BYTES);
    const ciphertext = encrypted.subarray(CIPHER_IV_BYTES + CIPHER_TAG_BYTES);

    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv, { authTagLength: CIPHER_TAG_BYTES });
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  static generateRsaKeyPair (): RsaKeyPairDto {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: CRYPTO_DEFAULTS.RSA_MODULUS_LENGTH,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
  }
}
