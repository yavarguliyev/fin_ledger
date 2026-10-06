import { CONTENT_DISPOSITION } from '../constants/download/content-disposition.constant';
import { ContentDispositionDto } from '../dtos/strategy/content-disposition.dto';

export class ContentDispositionHelper {
  static header ({ disposition, fileName }: ContentDispositionDto): string {
    if (disposition === CONTENT_DISPOSITION.INLINE) return CONTENT_DISPOSITION.INLINE;

    const name = fileName?.trim() || CONTENT_DISPOSITION.FALLBACK_NAME;
    const ascii = name.replace(CONTENT_DISPOSITION.UNSAFE_ASCII, CONTENT_DISPOSITION.REPLACEMENT);
    const encoded = encodeURIComponent(name);

    return [CONTENT_DISPOSITION.ATTACHMENT, `filename="${ascii}"`, `filename*=${CONTENT_DISPOSITION.ENCODING_PREFIX}${encoded}`].join(CONTENT_DISPOSITION.SEPARATOR);
  }
}
