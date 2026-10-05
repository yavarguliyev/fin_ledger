import { PROVIDER_CUSTOMERS_TEST as P } from '../constants/provider-customers.constant';
import { DbHelper } from '../helpers/db.helper';
import { ProviderCountRow, ProviderCustomerDto, ProviderEmailDto } from '../interfaces/provider-customers.interface';

describe('Provider customers', () => {
  const insert = ({ email, customerId, provider = P.PROVIDER }: ProviderCustomerDto): Promise<unknown> =>
    DbHelper.query({ sql: P.INSERT_SQL, params: [email, provider, customerId] });

  const countFor = async ({ email }: ProviderEmailDto): Promise<number> => {
    const [row] = await DbHelper.query<ProviderCountRow>({ sql: P.COUNT_SQL, params: [email] });

    return row?.count ?? 0;
  };

  afterAll(async () => DbHelper.close());

  it('stores one customer per provider for a user', async () => {
    await insert({ email: P.FIRST_EMAIL, customerId: P.CUSTOMER_ID });

    await expect(countFor({ email: P.FIRST_EMAIL })).resolves.toBe(1);
  });

  it('refuses a second customer for the same user and provider, which is what the email search used to allow', async () => {
    await expect(insert({ email: P.FIRST_EMAIL, customerId: P.OTHER_CUSTOMER_ID })).rejects.toThrow(
      P.UNIQUE_USER_CONSTRAINT
    );

    await expect(countFor({ email: P.FIRST_EMAIL })).resolves.toBe(1);
  });

  it('refuses the same provider customer being shared by two accounts', async () => {
    await expect(insert({ email: P.SECOND_EMAIL, customerId: P.CUSTOMER_ID })).rejects.toThrow(
      P.UNIQUE_EXTERNAL_CONSTRAINT
    );
  });

  it('refuses a provider that is not one of the adapters', async () => {
    await expect(
      insert({ email: P.SECOND_EMAIL, customerId: P.OTHER_CUSTOMER_ID, provider: P.BAD_PROVIDER })
    ).rejects.toThrow(P.PROVIDER_CONSTRAINT);
  });
});
