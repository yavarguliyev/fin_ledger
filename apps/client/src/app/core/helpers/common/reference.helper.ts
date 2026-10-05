import { REFERENCE } from '../../constants/common/reference.constant';
import { TABLE } from '../../constants/ui/table.constant';
import { ReferenceRefDto } from '../../interfaces/common/reference-ref.interface';

export class ReferenceHelper {
  static short ({ reference }: ReferenceRefDto): string {
    if (!reference || typeof reference !== 'string') return TABLE.EMPTY_CELL;
    return reference.replace(REFERENCE.UUID_PATTERN, id => id.slice(0, REFERENCE.SHORT_LENGTH));
  }
}
