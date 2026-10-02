import { MESSAGE_SEARCH } from '../constants/chat/message-search.constant';
import { SearchTermDto } from '../dtos/input/search-term.dto';

export class SearchTermHelper {
  static likePattern ({ term }: SearchTermDto): string {
    return `${MESSAGE_SEARCH.WILDCARD}${term.replace(MESSAGE_SEARCH.SPECIAL_CHARACTERS, MESSAGE_SEARCH.ESCAPED)}${MESSAGE_SEARCH.WILDCARD}`;
  }
}
