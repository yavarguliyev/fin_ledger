import { PROVIDER_CUSTOMERS_TEST } from '../constants/provider-customers.constant';
import { DbHelper } from '../helpers/db.helper';

describe('Provider customers', () => {
  const insert = (email: string, customerId: string, provider: string = PROVIDER_CUSTOMERS_TEST.PROVIDER): Promise<unknown> =>
    DbHelper.query({ sql: PROVIDER_CUSTOMERS_TEST.INSERT_SQL, params: [email, provider, customerId] });

  const countFor = async (email: string): Promise<number> => {
    const [row] = await DbHelper.query<{ count: number }>({ sql: PROVIDER_CUSTOMERS_TEST.COUNT_SQL, params: [email] });

    return row?.count ?? 0;
  };

  afterAll(async () => DbHelper.close());

  it('stores one customer per provider for a user', async () => {
    await insert(PROVIDER_CUSTOMERS_TEST.FIRST_EMAIL, PROVIDER_CUSTOMERS_TEST.CUSTOMER_ID);

    await expect(countFor(PROVIDER_CUSTOMERS_TEST.FIRST_EMAIL)).resolves.toBe(1);
  });

  it('refuses a second customer for the same user and provider, which is what the email search used to allow', async () => {
    await expect(insert(PROVIDER_CUSTOMERS_TEST.FIRST_EMAIL, PROVIDER_CUSTOMERS_TEST.OTHER_CUSTOMER_ID)).rejects.toThrow(
      PROVIDER_CUSTOMERS_TEST.UNIQUE_USER_CONSTRAINT
    );

    await expect(countFor(PROVIDER_CUSTOMERS_TEST.FIRST_EMAIL)).resolves.toBe(1);
  });

  it('refuses the same provider customer being shared by two accounts', async () => {
    await expect(insert(PROVIDER_CUSTOMERS_TEST.SECOND_EMAIL, PROVIDER_CUSTOMERS_TEST.CUSTOMER_ID)).rejects.toThrow(
      PROVIDER_CUSTOMERS_TEST.UNIQUE_EXTERNAL_CONSTRAINT
    );
  });

  it('refuses a provider that is not one of the adapters', async () => {
    await expect(
      insert(PROVIDER_CUSTOMERS_TEST.SECOND_EMAIL, PROVIDER_CUSTOMERS_TEST.OTHER_CUSTOMER_ID, PROVIDER_CUSTOMERS_TEST.BAD_PROVIDER)
    ).rejects.toThrow(PROVIDER_CUSTOMERS_TEST.PROVIDER_CONSTRAINT);
  });
});
