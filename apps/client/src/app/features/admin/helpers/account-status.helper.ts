export class AccountStatusHelper {
  static confirm ({ email, suspend }: { email: string; suspend: boolean }): boolean {
    const message = suspend
      ? `Suspend ${email}? They are signed out immediately and cannot sign in until reactivated.`
      : `Reactivate ${email}? They will be able to sign in again.`;

    return confirm(message);
  }
}
