export class EmailHelper {
  static maskEmail (email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name.substring(0, 2)}***@${domain}`;
  }
}
