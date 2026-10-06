import { LINK_PREVIEW } from '../../constants/support/link-preview.constant';
import { LinkTextDto } from '../../interfaces/support/link-text.interface';
import { LinkUrlDto } from '../../interfaces/support/link-url.interface';

export class LinkPreviewHelper {
  static firstUrl ({ text }: LinkTextDto): string | null {
    const match = LINK_PREVIEW.URL_PATTERN.exec(text)?.[0];
    return match ? match.replace(LINK_PREVIEW.TRAILING_PUNCTUATION, LINK_PREVIEW.EMPTY) : null;
  }

  static host ({ url }: LinkUrlDto): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }
}
