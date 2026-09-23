import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

import { TwilioTransport } from '../modules/transports/twilio.transport';

interface CapturedRequest {
  url: string;
  authorization: string;
  body: string;
}

const ACCOUNT_SID = 'AC_test_sid';
const AUTH_TOKEN = 'test_token';
const FROM = '+15550000000';
const SMS = { phoneNumber: '+15551234567', message: 'Your verification code is 482913', purpose: 'phone-verification' };

describe('TwilioTransport', () => {
  let server: Server;
  let baseUrl: string;
  let status = 201;
  const requests: CapturedRequest[] = [];

  beforeAll(async () => {
    server = createServer((request: IncomingMessage, response: ServerResponse) => {
      let body = '';

      request.on('data', chunk => (body += String(chunk)));
      request.on('end', () => {
        requests.push({ url: request.url ?? '', authorization: request.headers.authorization ?? '', body });
        response.writeHead(status, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ sid: 'SM123' }));
      });
    });

    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/2010-04-01/Accounts`;
  });

  afterAll(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
  });

  beforeEach(() => {
    requests.length = 0;
    status = 201;
  });

  it('posts the message to the account endpoint with basic auth', async () => {
    await new TwilioTransport({ accountSid: ACCOUNT_SID, authToken: AUTH_TOKEN, from: FROM, baseUrl }).send(SMS);

    const [request] = requests;
    expect(request?.url).toBe(`/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`);
    expect(request?.authorization).toBe(`Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`);

    const sent = new URLSearchParams(request?.body ?? '');
    expect(sent.get('From')).toBe(FROM);
    expect(sent.get('To')).toBe(SMS.phoneNumber);
    expect(sent.get('Body')).toBe(SMS.message);
  });

  it('raises when the provider rejects the message', async () => {
    status = 401;

    await expect(new TwilioTransport({ accountSid: ACCOUNT_SID, authToken: AUTH_TOKEN, from: FROM, baseUrl }).send(SMS)).rejects.toThrow('401');
  });
});
