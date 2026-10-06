import { z } from 'zod';

import { EVENT_CONTRACTS } from '../../src/modules/events/event-contracts.contract';

describe('Published event contracts', () => {
  it.each(Object.entries(EVENT_CONTRACTS))('%s keeps its published payload shape', (eventType, { version, schema }) => {
    expect({ eventType, version, schema: z.toJSONSchema(schema) }).toMatchSnapshot();
  });
});
