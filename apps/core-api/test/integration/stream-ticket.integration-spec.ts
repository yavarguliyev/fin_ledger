import { STREAM_TICKET } from '../constants/stream-ticket.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { StreamTicketResponse } from '../interfaces/stream-ticket-response.interface';

describe('Notification stream authentication', () => {
  afterAll(async () => DbHelper.close());

  const issueTicket = async (token: string): Promise<string> => {
    const response = await ApiHelper.request<StreamTicketResponse>({ method: 'POST', path: STREAM_TICKET.TICKET_PATH, token, body: {} });

    expect(response.status).toBe(STREAM_TICKET.CREATED);
    return response.body.ticket;
  };

  it('refuses an access token passed in the stream URL', async () => {
    const token = await ApiHelper.login({ email: STREAM_TICKET.USER });

    await expect(ApiHelper.stream({ path: `${STREAM_TICKET.STREAM_PATH}?${STREAM_TICKET.TOKEN_PARAM}=${token}` })).resolves.toBe(
      STREAM_TICKET.UNAUTHORIZED
    );
  });

  it('opens the stream with a ticket and refuses the same ticket twice', async () => {
    const token = await ApiHelper.login({ email: STREAM_TICKET.USER });
    const ticket = await issueTicket(token);
    const path = `${STREAM_TICKET.STREAM_PATH}?${STREAM_TICKET.TICKET_PARAM}=${ticket}`;

    await expect(ApiHelper.stream({ path })).resolves.toBe(STREAM_TICKET.OK);
    await expect(ApiHelper.stream({ path })).resolves.toBe(STREAM_TICKET.UNAUTHORIZED);
  });

  it('refuses the stream with no ticket at all', async () => {
    await expect(ApiHelper.stream({ path: STREAM_TICKET.STREAM_PATH })).resolves.toBe(STREAM_TICKET.UNAUTHORIZED);
  });

  it('will not issue a ticket without a session', async () => {
    await expect(ApiHelper.request({ method: 'POST', path: STREAM_TICKET.TICKET_PATH, body: {} })).resolves.toMatchObject({
      status: STREAM_TICKET.UNAUTHORIZED
    });
  });
});
