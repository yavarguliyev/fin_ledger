import { ExperimentalWarningFilter } from '../../src/modules/lifecycle/experimental-warning-filter';
import { WARNING_SPEC } from '../constants/experimental-warning.constant';

const named = (message: string, name: string): Error => {
  const warning = new Error(message);
  warning.name = name;

  return warning;
};

describe('ExperimentalWarningFilter', () => {
  const original = process.emitWarning;
  const emitted: string[] = [];

  beforeAll(() => {
    process.emitWarning = ((warning: string | Error): void => {
      emitted.push(warning instanceof Error ? warning.message : warning);
    }) as typeof process.emitWarning;

    ExperimentalWarningFilter.install();
  });

  beforeEach(() => {
    emitted.length = 0;
  });

  afterAll(() => {
    process.emitWarning = original;
  });

  it('drops only the post-quantum probe warnings the WebAuthn library triggers', () => {
    process.emitWarning(named(WARNING_SPEC.SILENCED_METHOD, WARNING_SPEC.EXPERIMENTAL));
    process.emitWarning(named(WARNING_SPEC.SILENCED_ALGORITHM, WARNING_SPEC.EXPERIMENTAL));

    expect(emitted).toEqual([]);
  });

  it('keeps every other experimental warning, so a real one is still visible', () => {
    process.emitWarning(named(WARNING_SPEC.KEPT_EXPERIMENTAL, WARNING_SPEC.EXPERIMENTAL));

    expect(emitted).toEqual([WARNING_SPEC.KEPT_EXPERIMENTAL]);
  });

  it('never silences a warning of another kind that happens to mention crypto', () => {
    process.emitWarning(named(WARNING_SPEC.KEPT_DEPRECATION, WARNING_SPEC.DEPRECATION));

    expect(emitted).toEqual([WARNING_SPEC.KEPT_DEPRECATION]);
  });

  it('reads the kind from the type argument when the warning is a plain string', () => {
    process.emitWarning(WARNING_SPEC.SILENCED_METHOD, WARNING_SPEC.EXPERIMENTAL);
    process.emitWarning(WARNING_SPEC.KEPT_EXPERIMENTAL, WARNING_SPEC.EXPERIMENTAL);

    expect(emitted).toEqual([WARNING_SPEC.KEPT_EXPERIMENTAL]);
  });
});
