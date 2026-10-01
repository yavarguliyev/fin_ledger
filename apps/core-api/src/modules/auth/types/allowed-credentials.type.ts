import type { GenerateAuthenticationOptionsOpts } from '@simplewebauthn/server';

export type AllowedCredentials = NonNullable<GenerateAuthenticationOptionsOpts['allowCredentials']>;
