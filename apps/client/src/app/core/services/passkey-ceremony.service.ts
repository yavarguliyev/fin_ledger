import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

import { PasskeyHelper } from '../helpers/passkey/passkey.helper';
import { PasskeyLabelDto } from '../interfaces/passkey/passkey-label.interface';
import { PasskeyOutcome } from '../types/passkey/passkey-outcome.type';
import { PasskeyService } from './passkey.service';
import { SessionStore } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class PasskeyCeremonyService {
  private readonly passkeys = inject(PasskeyService);
  private readonly session = inject(SessionStore);

  async register ({ deviceLabel }: PasskeyLabelDto): Promise<PasskeyOutcome> {
    if (!PasskeyHelper.isAvailable()) return 'unsupported';

    return this.run(async () => {
      const optionsJSON = await firstValueFrom(this.passkeys.registerOptions());
      const response = await startRegistration({ optionsJSON });

      await firstValueFrom(this.passkeys.registerVerify({ response, ...(deviceLabel && { deviceLabel }) }));
    });
  }

  async login (): Promise<PasskeyOutcome> {
    if (!PasskeyHelper.isAvailable()) return 'unsupported';

    return this.run(async () => {
      const owner = PasskeyHelper.owner();
      const optionsJSON = await firstValueFrom(this.passkeys.loginOptions({ owner }));
      const response = await startAuthentication({ optionsJSON });
      const session = await firstValueFrom(this.passkeys.loginVerify({ owner, response }));

      this.session.adopt({ session });
    });
  }

  async stepUp (): Promise<PasskeyOutcome> {
    if (!PasskeyHelper.isAvailable()) return 'unsupported';

    return this.run(async () => {
      const optionsJSON = await firstValueFrom(this.passkeys.stepUpOptions());
      const response = await startAuthentication({ optionsJSON });

      await firstValueFrom(this.passkeys.stepUpVerify({ response }));
    });
  }

  private async run (ceremony: () => Promise<void>): Promise<PasskeyOutcome> {
    try {
      await ceremony();

      return 'completed';
    } catch (error) {
      return PasskeyHelper.isCancellation({ error }) ? 'cancelled' : 'failed';
    }
  }
}
