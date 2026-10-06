import { PanelPagingHelper } from '../../../src/app/core/helpers/support/panel-paging.helper';
import { PANEL_PAGING_TEST as T } from '../../constants/panel-paging.constant';

describe('PanelPagingHelper', () => {
  it('builds the next cursor from the oldest item on the page', () => {
    expect(PanelPagingHelper.cursor({ items: [T.FIRST, T.LAST] })).toEqual({ before: T.LAST.createdAt, beforeId: T.LAST.id });
  });

  it('starts from the top when nothing is loaded yet', () => {
    expect(PanelPagingHelper.cursor({ items: [] })).toEqual({});
  });

  it('expects more only after a full page', () => {
    const full = Array.from({ length: T.PAGE_SIZE }, () => T.FIRST);

    expect(PanelPagingHelper.hasMore({ items: full })).toBe(true);
    expect(PanelPagingHelper.hasMore({ items: [T.FIRST] })).toBe(false);
  });
});
