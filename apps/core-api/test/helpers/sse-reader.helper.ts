import { SSE_READER } from '../constants/sse-reader.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { SseEvent, SseOpenRequest, SseWaitRequest } from '../interfaces/sse-reader.interface';

export class SseReaderHelper {
  private readonly decoder = new TextDecoder();
  private buffer = '';

  private constructor (
    private readonly reader: ReadableStreamDefaultReader<Uint8Array>,
    private readonly controller: AbortController
  ) {}

  static async open ({ path }: SseOpenRequest): Promise<SseReaderHelper> {
    const controller = new AbortController();
    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${path}`, { signal: controller.signal });
    if (!response.body) throw new Error(`No stream body (${response.status})`);
    return new SseReaderHelper(response.body.getReader(), controller);
  }

  async waitFor ({ type, timeoutMs }: SseWaitRequest): Promise<SseEvent> {
    const deadline = setTimeout(() => this.controller.abort(), timeoutMs);
    try {
      for (;;) {
        const found = this.take({ type, timeoutMs });
        if (found) return found;
        const { value, done } = await this.reader.read();
        if (done) throw new Error(`Stream ended before ${type}`);
        this.buffer += this.decoder.decode(value, { stream: true });
      }
    } finally {
      clearTimeout(deadline);
    }
  }

  close (): void {
    this.controller.abort();
  }

  private take ({ type }: SseWaitRequest): SseEvent | null {
    const blocks = this.buffer.split(SSE_READER.EVENT_SEPARATOR);
    this.buffer = blocks.pop() ?? '';
    const events = blocks.flatMap(block =>
      block
        .split(SSE_READER.LINE_SEPARATOR)
        .filter(line => line.startsWith(SSE_READER.DATA_PREFIX))
        .map(line => JSON.parse(line.slice(SSE_READER.DATA_PREFIX.length)) as SseEvent)
    );
    return events.find(event => event.type === type) ?? null;
  }
}
