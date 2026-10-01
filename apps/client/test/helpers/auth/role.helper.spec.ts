import { RoleHelper } from '../../../src/app/core/helpers/auth/role.helper';
import { ROLES } from '../../../src/app/core/constants/auth/roles.constant';
import { SESSION } from '../../../src/app/core/constants/auth/session.constant';

const PLAYER_ROUTE = SESSION.PLAYER_ROUTE;
const STAFF_ROUTE = SESSION.STAFF_ROUTE;

describe('RoleHelper', () => {
  it('counts every back-office role as staff, and the player as not', () => {
    expect(RoleHelper.isStaff({ role: ROLES.GLOBAL_ADMIN })).toBe(true);
    expect(RoleHelper.isStaff({ role: ROLES.ADMIN })).toBe(true);
    expect(RoleHelper.isStaff({ role: ROLES.MODERATOR })).toBe(true);
    expect(RoleHelper.isStaff({ role: ROLES.USER })).toBe(false);
  });

  it('treats a missing role as neither staff nor player, so a signed-out view shows nothing privileged', () => {
    expect(RoleHelper.isStaff({ role: null })).toBe(false);
    expect(RoleHelper.isStaff({ role: undefined })).toBe(false);
    expect(RoleHelper.isPlayer({ role: null })).toBe(false);
  });

  it('sends the player to betting and everyone else to the dashboard', () => {
    expect(RoleHelper.landingRoute({ role: ROLES.USER })).toBe(PLAYER_ROUTE);
    expect(RoleHelper.landingRoute({ role: ROLES.MODERATOR })).toBe(STAFF_ROUTE);
    expect(RoleHelper.landingRoute({ role: ROLES.GLOBAL_ADMIN })).toBe(STAFF_ROUTE);
  });

  it('sends an unknown role to the dashboard, which is what the guard did before', () => {
    expect(RoleHelper.landingRoute({ role: null })).toBe(STAFF_ROUTE);
  });

  it('labels a role the way the shell used to, so the sidebar reads the same', () => {
    expect(RoleHelper.label({ role: ROLES.USER })).toBe('USER');
    expect(RoleHelper.label({ role: ROLES.GLOBAL_ADMIN })).toBe('GLOBAL_ADMIN');
    expect(RoleHelper.label({ role: null })).toBe('USER');
  });
});
