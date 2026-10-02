import { runInThisContext } from 'node:vm';

import { ExperimentalWarningFilter } from '../../src/modules/lifecycle/experimental-warning-filter';
import { WARNING_SPEC } from '../constants/experimental-warning.constant';

type Emitter = (message: string, type: string) => void;

const emitFrom = (filename: string): void => {
  const relay = runInThisContext(WARNING_SPEC.EMIT_CODE, { filename }) as (emit: Emitter, message: string, type: string) => void;
  relay(process.emitWarning.bind(process), WARNING_SPEC.NEGATIVE_TIMEOUT_MESSAGE, WARNING_SPEC.TIMEOUT_NEGATIVE);
};

describe('ExperimentalWarningFilter and negative timeouts', () => {
  const original = process.emitWarning.bind(process);
  const emitted: string[] = [];

  beforeAll(() => {
    process.emitWarning = ((warning: string | Error): void => {
      emitted.push(warning instanceof Error ? warning.message : warning);
    });

    ExperimentalWarningFilter.install();
  });

  beforeEach(() => {
    emitted.length = 0;
  });

  afterAll(() => {
    process.emitWarning = original;
  });

  it('drops the negative-timeout warning raised from inside kafkajs', () => {
    emitFrom(WARNING_SPEC.KAFKA_FILENAME);

    expect(emitted).toEqual([]);
  });

  it('keeps a negative-timeout warning raised by our own code', () => {
    emitFrom(WARNING_SPEC.OWN_FILENAME);

    expect(emitted).toEqual([WARNING_SPEC.NEGATIVE_TIMEOUT_MESSAGE]);
  });
});
