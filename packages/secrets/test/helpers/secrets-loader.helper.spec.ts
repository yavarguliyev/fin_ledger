import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

import { SecretsLoader } from '../../src/modules/helpers/secrets-loader.helper';
import { SECRETS_CONSTANTS as C } from '../../src/modules/constants/secrets/secrets.constant';
import { SECRETS_TEST as T } from '../constants/secrets.constant';

const send = jest.fn();

jest.mock('@aws-sdk/client-secrets-manager', () => {
  const actual = jest.requireActual<typeof import('@aws-sdk/client-secrets-manager')>('@aws-sdk/client-secrets-manager');
  return { ...actual, SecretsManagerClient: jest.fn(() => ({ send, destroy: jest.fn() })) };
});

const SECRET = { DB_PASSWORD: T.DB_PASSWORD, JWT_PRIVATE_KEY: T.JWT_KEY };

const awsEnv = (): NodeJS.ProcessEnv => ({
  [C.KEYS.SOURCE]: T.AWS,
  [C.KEYS.ID]: T.SECRET_ID,
  [C.KEYS.ENDPOINT]: T.ENDPOINT,
  [C.KEYS.REGION]: T.REGION,
  [C.KEYS.ACCESS_KEY_ID]: T.KEY,
  [C.KEYS.SECRET_ACCESS_KEY]: T.KEY
});

describe('SecretsLoader', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ SecretString: JSON.stringify(SECRET) });
  });

  it('does nothing unless the source is aws', async () => {
    const env: NodeJS.ProcessEnv = { [C.KEYS.SOURCE]: T.ENV };

    await expect(SecretsLoader.load({ env, envFiles: [T.MISSING_FILE] })).resolves.toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it('copies every secret into the environment, keeping multi-line values intact', async () => {
    const env = awsEnv();

    await expect(SecretsLoader.load({ env, envFiles: [T.MISSING_FILE] })).resolves.toBe(2);

    const [command] = send.mock.calls[0] as [GetSecretValueCommand];
    expect(command.input.SecretId).toBe(T.SECRET_ID);
    expect(env).toMatchObject(SECRET);
  });

  it('never overrides a variable the environment already sets', async () => {
    const env = { ...awsEnv(), DB_PASSWORD: T.EXPLICIT_PASSWORD };

    await expect(SecretsLoader.load({ env, envFiles: [T.MISSING_FILE] })).resolves.toBe(1);
    expect(env.DB_PASSWORD).toBe(T.EXPLICIT_PASSWORD);
  });

});

describe('SecretsLoader settings', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ SecretString: JSON.stringify(SECRET) });
  });

  it('reads its own settings from the env files without loading the rest of them, the first file winning', async () => {
    const dir = mkdtempSync(join(tmpdir(), T.TEMP_PREFIX));
    const [aws, local] = [join(dir, T.AWS_FILE_NAME), join(dir, T.LOCAL_FILE_NAME)];
    writeFileSync(aws, Object.entries(awsEnv()).map(([key, value]) => `${key}=${value}`).join('\n'));
    writeFileSync(local, `${C.KEYS.SOURCE}=${T.ENV}\n${C.KEYS.ID}=${T.OTHER_SECRET_ID}`);
    const env: NodeJS.ProcessEnv = {};

    await SecretsLoader.load({ env, envFiles: [aws, local] });

    expect(send).toHaveBeenCalledTimes(1);
    expect((send.mock.calls[0] as [GetSecretValueCommand])[0].input.SecretId).toBe(T.SECRET_ID);
    expect(env[C.KEYS.ID]).toBeUndefined();
    expect(env[T.DB_KEY]).toBe(T.DB_PASSWORD);
  });

  it('refuses to start without a secret ID or with an unreadable secret', async () => {
    const withoutId: NodeJS.ProcessEnv = { [C.KEYS.SOURCE]: T.AWS };
    await expect(SecretsLoader.load({ env: withoutId, envFiles: [T.MISSING_FILE] })).rejects.toThrow(C.ERRORS.MISSING_ID);

    send.mockResolvedValue({});
    await expect(SecretsLoader.load({ env: awsEnv(), envFiles: [T.MISSING_FILE] })).rejects.toThrow(C.ERRORS.EMPTY_SECRET);
  });
});
