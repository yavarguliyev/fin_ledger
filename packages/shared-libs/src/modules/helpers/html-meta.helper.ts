import { HTML_META } from '../constants/http/html-meta.constant';
import { SAFE_URL } from '../constants/http/safe-url.constant';
import { HtmlMetaInputDto } from '../dtos/http/html-meta-input.dto';
import { LinkMetaDto } from '../dtos/http/link-meta.dto';
import { MetaImageDto } from '../dtos/http/meta-image.dto';
import { MetaTextDto } from '../dtos/http/meta-text.dto';

export class HtmlMetaHelper {
  static preview ({ html, url }: HtmlMetaInputDto): LinkMetaDto {
    const meta = HtmlMetaHelper.metaTags({ html, url });
    const title = HtmlMetaHelper.text({ value: meta.get(HTML_META.OG_TITLE) ?? HTML_META.TITLE.exec(html)?.[1], max: HTML_META.TITLE_MAX });
    const description = HtmlMetaHelper.text({
      value: meta.get(HTML_META.OG_DESCRIPTION) ?? meta.get(HTML_META.DESCRIPTION),
      max: HTML_META.DESCRIPTION_MAX
    });
    const image = HtmlMetaHelper.image({ value: meta.get(HTML_META.OG_IMAGE), url });

    return { ...(title && { title }), ...(description && { description }), ...(image && { image }) };
  }

  private static metaTags ({ html }: HtmlMetaInputDto): Map<string, string> {
    const meta = new Map<string, string>();
    for (const [tag] of html.matchAll(HTML_META.META_TAG)) {
      const attributes = new Map([...tag.matchAll(HTML_META.ATTRIBUTE)].map(([, key = '', , double, single]) => [key.toLowerCase(), double ?? single ?? '']));
      const key = HTML_META.PROPERTY_KEYS.map(name => attributes.get(name)).find(Boolean)?.toLowerCase();
      const content = attributes.get(HTML_META.CONTENT_KEY);
      if (key && content && !meta.has(key)) meta.set(key, content);
    }
    return meta;
  }

  private static text ({ value, max }: MetaTextDto): string | undefined {
    const decoded = value
      ?.replace(HTML_META.ENTITY, entity => HTML_META.ENTITIES[entity as keyof typeof HTML_META.ENTITIES])
      .replace(HTML_META.WHITESPACE, HTML_META.SPACE)
      .trim();
    return decoded ? decoded.slice(0, max) : undefined;
  }

  private static image ({ value, url }: MetaImageDto): string | undefined {
    if (!value) return undefined;
    try {
      const resolved = new URL(value, url);
      return (SAFE_URL.PROTOCOLS as readonly string[]).includes(resolved.protocol) ? resolved.toString() : undefined;
    } catch {
      return undefined;
    }
  }
}
