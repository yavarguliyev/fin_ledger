import { LogRedactionHelper } from '../../src/modules/helpers/log-redaction.helper';
import { LOG_REDACTION_SPEC as L } from '../constants/log-redaction.constant';

describe('LogRedactionHelper', () => {
  it('masks passwords, bearer tokens, provider secret keys and card numbers', () => {
    expect(LogRedactionHelper.redact({ message: L.PASSWORD_JSON, revealLinks: false })).toBe(L.PASSWORD_REDACTED);
    expect(LogRedactionHelper.redact({ message: L.BEARER, revealLinks: false })).toBe(L.BEARER_REDACTED);
    expect(LogRedactionHelper.redact({ message: L.STRIPE_KEY, revealLinks: false })).toBe(L.STRIPE_REDACTED);
    expect(LogRedactionHelper.redact({ message: L.CARD, revealLinks: false })).toBe(L.CARD_REDACTED);
  });

  it('masks token links in production and keeps them when links are revealed for local development', () => {
    expect(LogRedactionHelper.redact({ message: L.LINK, revealLinks: false })).toBe(L.LINK_REDACTED);
    expect(LogRedactionHelper.redact({ message: L.LINK, revealLinks: true })).toBe(L.LINK);
    expect(LogRedactionHelper.redact({ message: L.PASSWORD_JSON, revealLinks: true })).toBe(L.PASSWORD_REDACTED);
  });

  it('leaves ids and ordinary numbers alone', () => {
    expect(LogRedactionHelper.redact({ message: L.UUID, revealLinks: false })).toBe(L.UUID);
    expect(LogRedactionHelper.redact({ message: L.AMOUNT, revealLinks: false })).toBe(L.AMOUNT);
  });
});
