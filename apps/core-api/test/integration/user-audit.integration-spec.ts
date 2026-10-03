import { USER_AUDIT_TEST } from '../constants/user-audit.constant';
import { ApiHelper } from '../helpers/api.helper';
import { AuditLogHelper } from '../helpers/audit-log.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

describe('Auditing admin actions on users', () => {
  let admin: string;
  let userId: string;

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [USER_AUDIT_TEST.EMAIL] });
    admin = await ApiHelper.login({ email: USER_AUDIT_TEST.ADMIN_EMAIL });
    userId = await TestUserHelper.idOf({ email: USER_AUDIT_TEST.EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('records suspension and reactivation against the user with the named actions', async () => {
    await expect(ApiHelper.request({ method: 'POST', path: USER_AUDIT_TEST.SUSPEND_PATH(userId), token: admin })).resolves.toMatchObject({
      status: USER_AUDIT_TEST.CREATED_STATUS
    });
    await expect(ApiHelper.request({ method: 'POST', path: USER_AUDIT_TEST.REACTIVATE_PATH(userId), token: admin })).resolves.toMatchObject({
      status: USER_AUDIT_TEST.CREATED_STATUS
    });

    for (const action of [USER_AUDIT_TEST.SUSPENDED, USER_AUDIT_TEST.REACTIVATED]) {
      await expect(AuditLogHelper.waitFor({ entityId: userId, action })).resolves.toEqual({
        action,
        entity_type: USER_AUDIT_TEST.ENTITY_TYPE,
        entity_id: userId
      });
    }
  });
});
