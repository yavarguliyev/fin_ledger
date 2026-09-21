import { DatabaseErrorCode } from '@common/shared-libs';

import { Translation } from '../interfaces/translation.interface';

export const TRANSLATIONS: Record<DatabaseErrorCode, Translation> = {
  '23505': { code: 'DUPLICATE_RESOURCE', status: 409, message: 'A record with these details already exists' },
  '23503': { code: 'RELATED_RESOURCE_CONFLICT', status: 409, message: 'A related record is missing or still in use' },
  '23514': { code: 'CONSTRAINT_VIOLATION', status: 409, message: 'The request conflicts with a data rule' },
  '23502': { code: 'MISSING_REQUIRED_FIELD', status: 400, message: 'A required field was not provided' },
  '23P01': { code: 'RESOURCE_OVERLAP', status: 409, message: 'The request overlaps an existing record' },
  '22003': { code: 'VALUE_OUT_OF_RANGE', status: 400, message: 'A numeric value is out of range' },
  '22P02': { code: 'INVALID_VALUE', status: 400, message: 'A value has an invalid format' },
  '0A000': { code: 'IMMUTABLE_RECORD', status: 409, message: 'This record is append-only and cannot be changed' },
  '42501': { code: 'FORBIDDEN', status: 403, message: 'Not permitted to access this record' }
};
