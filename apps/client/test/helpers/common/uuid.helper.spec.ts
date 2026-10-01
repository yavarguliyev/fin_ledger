import { UuidHelper } from '../../../src/app/core/helpers/common/uuid.helper';
import { UUID_TEST } from '../../constants/uuid.constant';

describe('UuidHelper', () => {
  it('generates a version 7 UUID, matching the ids the backend and database use', () => {
    expect(UuidHelper.generate()).toMatch(UUID_TEST.V7_PATTERN);
  });

  it('generates ids that sort in creation order', () => {
    const ids = Array.from({ length: UUID_TEST.SAMPLE_SIZE }, () => UuidHelper.generate());

    expect([...ids].sort()).toEqual(ids);
  });
});
