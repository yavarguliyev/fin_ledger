import { EVENT_TYPES } from '../../src/modules/events/event-type-values.contract';
import { EventContractHelper } from '../../src/modules/helpers/event-contract.helper';
import { EVENT_CONTRACT_TEST as T } from '../constants/event-contract.constant';

describe('EventContractHelper.violation', () => {
  it('accepts a payload that matches its versioned contract', () => {
    expect(EventContractHelper.violation({ eventType: EVENT_TYPES.BET_SETTLED, payload: { ...T.BET } })).toBeNull();
  });

  it('names the event, the version and the field when a payload breaks its contract', () => {
    const payload: Record<string, unknown> = { ...T.BET, status: T.BAD_STATUS };
    delete payload[T.MISSING_FIELD];
    const violation = EventContractHelper.violation({ eventType: EVENT_TYPES.BET_SETTLED, payload });

    expect(violation).toContain(`${EVENT_TYPES.BET_SETTLED} v1`);
    expect(violation).toContain(T.MISSING_FIELD);
  });

  it('leaves event types without a contract alone', () => {
    expect(EventContractHelper.violation({ eventType: T.UNKNOWN_TYPE, payload: {} })).toBeNull();
  });
});
