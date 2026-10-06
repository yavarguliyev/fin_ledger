import { ContentDispositionHelper } from '../../src/modules/helpers/content-disposition.helper';
import { CONTENT_DISPOSITION_TEST as T } from '../constants/content-disposition.constant';

describe('ContentDispositionHelper.header', () => {
  it('serves inline without a file name', () => {
    expect(ContentDispositionHelper.header({ disposition: T.INLINE, fileName: T.PLAIN_NAME })).toBe(T.INLINE);
  });

  it('names an attachment and keeps a UTF-8 copy of the original name', () => {
    expect(ContentDispositionHelper.header({ disposition: T.ATTACHMENT, fileName: T.PLAIN_NAME })).toBe(T.PLAIN_HEADER);
    expect(ContentDispositionHelper.header({ disposition: T.ATTACHMENT, fileName: T.TRICKY_NAME })).toBe(T.TRICKY_HEADER);
  });

  it('falls back to a generic name when there is none', () => {
    expect(ContentDispositionHelper.header({ disposition: T.ATTACHMENT, fileName: T.BLANK_NAME })).toBe(T.FALLBACK_HEADER);
    expect(ContentDispositionHelper.header({ disposition: T.ATTACHMENT, fileName: null })).toBe(T.FALLBACK_HEADER);
  });
});
