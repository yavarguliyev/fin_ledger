import { TextBodyDto } from '../dtos/text-body.dto';

export class TextBodyHelper {
  static parse ({ value }: TextBodyDto): unknown {
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
}
