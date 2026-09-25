import { ConfigService } from '@nestjs/config';
import { generateSync } from 'otplib';
import { CryptoHelper } from '@common/shared-libs';

import { TotpService } from '../src/modules/services/totp.service';
import { RecoveryCodeHelper } from '../src/modules/helpers/recovery-code.helper';

const configOf = (values: Record<string, string>): ConfigService => ({ get: (key: string) => values[key] }) as unknown as ConfigService;
const key = CryptoHelper.randomBytes({ bytes: 32 }).toString('base64');
const service = (): TotpService => new TotpService({ configService: configOf({ MFA_ENCRYPTION_KEY: key, MFA_ISSUER: 'Test Wallet' }) });

describe('TotpService configuration', () => {
  it('refuses to start without a 32-byte encryption key', () => {
    expect(() => new TotpService({ configService: configOf({}) })).toThrow(/MFA_ENCRYPTION_KEY/);
    expect(
      () => new TotpService({ configService: configOf({ MFA_ENCRYPTION_KEY: CryptoHelper.randomBytes({ bytes: 16 }).toString('base64') }) })
    ).toThrow(/MFA_ENCRYPTION_KEY/);
  });
});

describe('TotpService enrollment', () => {
  it('builds an otpauth URI with the issuer and account, and a PNG QR code', async () => {
    const totp = service();
    const secret = totp.createSecret();
    const { otpauthUri, qrCodeDataUrl } = await totp.buildEnrollment({ secret, accountName: 'player@test.io' });

    expect(otpauthUri).toMatch(/^otpauth:\/\/totp\//);
    expect(otpauthUri).toContain('issuer=Test%20Wallet');
    expect(otpauthUri).toContain(`secret=${secret}`);
    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe('TotpService verification', () => {
  const totp = service();
  const secret = totp.createSecret();

  it('accepts the current code and returns its time step', () => {
    const result = totp.verify({ secret, code: generateSync({ secret }), lastUsedStep: null });
    expect(result.valid).toBe(true);
    expect(Number.isInteger(result.timeStep)).toBe(true);
  });

  it('accepts the previous 30-second code (clock drift) but not older ones', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(totp.verify({ secret, code: generateSync({ secret, epoch: now - 30 }), lastUsedStep: null }).valid).toBe(true);
    expect(totp.verify({ secret, code: generateSync({ secret, epoch: now - 120 }), lastUsedStep: null }).valid).toBe(false);
  });

  it('rejects a code that was already used (replay)', () => {
    const code = generateSync({ secret });
    const first = totp.verify({ secret, code, lastUsedStep: null });

    expect(first.valid).toBe(true);
    expect(totp.verify({ secret, code, lastUsedStep: first.timeStep as number }).valid).toBe(false);
  });

  it('rejects wrong or malformed codes', () => {
    expect(totp.verify({ secret, code: '000000', lastUsedStep: null }).valid).toBe(false);
    expect(totp.verify({ secret, code: 'abc123', lastUsedStep: null }).valid).toBe(false);
    expect(totp.verify({ secret, code: '12345', lastUsedStep: null }).valid).toBe(false);
  });
});

describe('TotpService secret encryption', () => {
  it('round-trips, never stores the plain secret, and uses a fresh IV every time', () => {
    const totp = service();
    const secret = totp.createSecret();
    const first = totp.encryptSecret({ secret });
    const second = totp.encryptSecret({ secret });

    expect(totp.decryptSecret({ encrypted: first })).toBe(secret);
    expect(first.toString('utf8')).not.toContain(secret);
    expect(first.equals(second)).toBe(false);
  });

  it('rejects tampered ciphertext and a different key', () => {
    const totp = service();
    const encrypted = totp.encryptSecret({ secret: totp.createSecret() });
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] as number) ^ 0xff;

    expect(() => totp.decryptSecret({ encrypted: tampered })).toThrow();

    const otherKey = new TotpService({ configService: configOf({ MFA_ENCRYPTION_KEY: CryptoHelper.randomBytes({ bytes: 32 }).toString('base64') }) });
    expect(() => otherKey.decryptSecret({ encrypted })).toThrow();
  });
});

describe('RecoveryCodeHelper', () => {
  it('creates 10 unique codes and matching hashes', () => {
    const { codes, hashes } = RecoveryCodeHelper.generate();

    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    codes.forEach(code => expect(code).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/));
    expect(hashes).toEqual(codes.map(code => RecoveryCodeHelper.hash({ code })));
  });

  it('hashes a code the same way however the user types it', () => {
    const [code] = RecoveryCodeHelper.generate().codes as [string];
    expect(RecoveryCodeHelper.hash({ code: ` ${code.toLowerCase().replace('-', ' ')} ` })).toBe(RecoveryCodeHelper.hash({ code }));
  });
});
