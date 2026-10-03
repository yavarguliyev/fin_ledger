import { ResponseRef } from '../interfaces/fakes.interface';

export const chunksOf = ({ response }: ResponseRef): AsyncIterable<Uint8Array> => response.body as unknown as AsyncIterable<Uint8Array>;
