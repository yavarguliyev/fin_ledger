import { inflateSync } from 'node:zlib';

import { PDF_TEXT } from '../constants/pdf-text.constant';

export class PdfTextHelper {
  static extract (bytes: Buffer): string {
    const raw = bytes.toString(PDF_TEXT.BINARY);
    const streams = [...raw.matchAll(PDF_TEXT.STREAM_PATTERN)].map(match => Buffer.from(match[1] ?? '', PDF_TEXT.BINARY));
    const decoded = streams.map(stream => {
      try {
        return inflateSync(stream).toString(PDF_TEXT.BINARY);
      } catch {
        return stream.toString(PDF_TEXT.BINARY);
      }
    });

    return decoded
      .flatMap(content => [...content.matchAll(PDF_TEXT.HEX_PATTERN)].map(match => Buffer.from(match[1] ?? '', PDF_TEXT.HEX).toString(PDF_TEXT.BINARY)))
      .join(PDF_TEXT.EMPTY);
  }
}
