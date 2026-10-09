import { SidebarStateService } from '../../src/app/core/services/sidebar-state.service';
import { SIDEBAR } from '../../src/app/core/constants/ui/sidebar.constant';

describe('SidebarStateService', () => {
  beforeEach(() => localStorage.clear());

  it('starts expanded and remembers when the sidebar is collapsed', () => {
    const sidebar = new SidebarStateService();
    expect(sidebar.collapsed()).toBe(false);

    sidebar.toggle();
    expect(sidebar.collapsed()).toBe(true);
    expect(new SidebarStateService().collapsed()).toBe(true);
  });

  it('forgets the choice once the sidebar is expanded again', () => {
    localStorage.setItem(SIDEBAR.STORAGE_KEY, SIDEBAR.COLLAPSED_VALUE);
    const sidebar = new SidebarStateService();
    sidebar.toggle();

    expect(localStorage.getItem(SIDEBAR.STORAGE_KEY)).toBeNull();
  });
});
