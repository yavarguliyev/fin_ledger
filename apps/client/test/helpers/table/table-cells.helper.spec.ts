import { ReferenceHelper } from '../../../src/app/core/helpers/common/reference.helper';
import { DataTableHelper } from '../../../src/app/shared/components/data-table/helpers/data-table.helper';
import { TableColumn } from '../../../src/app/core/interfaces/ui/table-column.interface';
import { TABLE_CELLS_TEST as T } from '../../constants/table-cells.constant';

describe('Table cells', () => {
  it('formats a date column like the profile instead of showing the raw ISO timestamp', () => {
    const column: TableColumn<{ createdAt: string }> = { key: T.DATE_KEY, label: T.DATE_LABEL, type: 'date' };
    const text = DataTableHelper.getCellText({ row: { createdAt: T.ISO }, column });

    expect(text).not.toMatch(T.ISO_PATTERN);
    expect(text).toMatch(T.FORMATTED_PATTERN);
  });

  it('shortens the UUID inside a reference so it fits on one line', () => {
    expect(ReferenceHelper.short({ reference: T.REFERENCE })).toBe(T.SHORT_REFERENCE);
  });

  it('keeps a reference without an id and shows a dash for none', () => {
    expect(ReferenceHelper.short({ reference: T.PLAIN_REFERENCE })).toBe(T.PLAIN_REFERENCE);
    expect(ReferenceHelper.short({ reference: null })).toBe(T.EMPTY);
  });
});
