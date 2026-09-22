import { UnknownRecord } from '../../types/base.type';
import { ExtractIdKeyDto } from '../../dtos/helper/extract-id-key.dto';

export const EXTRACT_ID_KEY = ({ result, field }: ExtractIdKeyDto): string => (result as UnknownRecord)[field] as string;
