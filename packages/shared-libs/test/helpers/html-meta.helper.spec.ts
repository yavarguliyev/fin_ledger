import { HtmlMetaHelper } from '../../src/modules/helpers/html-meta.helper';
import { HTML_META_SPEC as T } from '../constants/html-meta.constant';

describe('HtmlMetaHelper.preview', () => {
  it('prefers Open Graph tags, decodes entities, collapses whitespace and resolves the image against the page', () => {
    expect(HtmlMetaHelper.preview({ html: T.OPEN_GRAPH, url: T.URL })).toEqual({ title: T.TITLE, description: T.DESCRIPTION, image: T.IMAGE });
  });

  it('falls back to the page title and description meta tag', () => {
    expect(HtmlMetaHelper.preview({ html: T.PLAIN, url: T.URL })).toEqual({ title: T.PLAIN_TITLE, description: T.PLAIN_DESCRIPTION });
  });

  it('drops an image that is not http or https', () => {
    expect(HtmlMetaHelper.preview({ html: T.UNSAFE_IMAGE, url: T.URL }).image).toBeUndefined();
  });

  it('caps a long title', () => {
    const html = `<title>${T.LETTER.repeat(T.LONG_TITLE_LENGTH)}</title>`;

    expect(HtmlMetaHelper.preview({ html, url: T.URL }).title).toHaveLength(T.TITLE_MAX);
  });
});
