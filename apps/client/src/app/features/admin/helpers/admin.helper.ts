import { AdminUser } from '../../../core/interfaces/admin/admin-user.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { ADMIN_TABLE } from '../../../core/constants/admin/admin-table.constant';
import { AdminColumnsDto } from '../../../core/interfaces/admin/admin-columns.interface';
import { AccountStatusColumnDto } from '../../../core/interfaces/admin/account-status-column.interface';
import { ActionsColumnDto } from '../../../core/interfaces/admin/actions-column.interface';
import { ToggleColumnsDto } from '../../../core/interfaces/admin/toggle-columns.interface';
import { MinorAmountDto } from '../../../core/interfaces/wallet/minor-amount.interface';
import { DashboardStatsRefDto } from '../../../core/interfaces/admin/dashboard-stats-ref.interface';
import { StatCardHelper } from './stat-card.helper';

export class AdminHelper {
  static buildStatCards ({ stats }: DashboardStatsRefDto): StatCard[] {
    return StatCardHelper.build({ stats });
  }

  static formatCurrencyCompact ({ amountMinor }: MinorAmountDto): string {
    return CurrencyHelper.formatCurrencyCompact({ amountMinor });
  }

  static getAdminTableColumns (dto: AdminColumnsDto): TableColumn<AdminUser>[] {
    const { onStatusToggle, onEmailVerificationToggle, onDeletedToggle, onView, onAnonymize, isGlobalAdmin, onAccountStatusToggle, currentUserId } =
      dto;

    return [
      ...AdminHelper.createBaseColumns(),
      AdminHelper.createAccountStatusColumn({ onAccountStatusToggle, currentUserId }),
      ...AdminHelper.createToggleColumns({ onStatusToggle, onEmailVerificationToggle, onDeletedToggle }),
      AdminHelper.createActionsColumn({ onView, onAnonymize, showDelete: isGlobalAdmin })
    ];
  }

  private static createAccountStatusColumn ({ onAccountStatusToggle, currentUserId }: AccountStatusColumnDto): TableColumn<AdminUser> {
    return {
      key: 'userStatus',
      label: 'Account',
      type: 'toggle',
      align: 'center',
      getToggleValue: ({ row }): boolean => row.userStatus === ADMIN_TABLE.ACTIVE_STATUS,
      toggleDisabled: ({ row }): boolean =>
        row.id === currentUserId || row.userStatus === ADMIN_TABLE.CLOSED_STATUS || row.userStatus === ADMIN_TABLE.PENDING_STATUS,
      toggleCallback: ({ value, row }): void => onAccountStatusToggle({ userId: row.id, isEnabled: !value })
    };
  }

  private static createActionsColumn ({ onView, onAnonymize, showDelete }: ActionsColumnDto): TableColumn<AdminUser> {
    return {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'center',
      actions: {
        view: true,
        update: false,
        delete: showDelete,
        deleteLabel: ADMIN_TABLE.ANONYMIZE_LABEL,
        onView: ({ row }): void => onView({ userId: row.id }),
        onDelete: ({ row }): void => onAnonymize({ userId: row.id })
      }
    };
  }

  private static createBaseColumns (): TableColumn<AdminUser>[] {
    return [
      { key: 'name', label: 'Name', type: 'text', align: 'center' },
      { key: 'email', label: 'Email', type: 'text', align: 'center' },
      {
        key: 'role',
        label: 'Role',
        type: 'badge',
        align: 'center',
        badgeClass: (): string => ADMIN_TABLE.ROLE_BADGE_CLASS,
        format: ({ value }): string => {
          const role = String(value);
          return role.charAt(0).toUpperCase() + role.slice(1);
        }
      },
      {
        key: 'balance',
        label: 'Balance',
        type: 'currency',
        align: 'center',
        format: ({ value, row }): string => CurrencyHelper.formatCurrency({ amountMinor: Number(value), currency: row.currency })
      }
    ];
  }

  private static createToggleColumns (dto: ToggleColumnsDto): TableColumn<AdminUser>[] {
    const { onStatusToggle, onEmailVerificationToggle, onDeletedToggle } = dto;

    return [
      {
        key: 'status',
        label: 'Wallet Status',
        type: 'toggle',
        align: 'center',
        getToggleValue: ({ row }): boolean => row.status?.toUpperCase() === ADMIN_TABLE.ACTIVE_STATUS,
        toggleCallback: ({ value, row }): void => onStatusToggle({ walletId: row.walletId, isActive: value })
      },
      {
        key: 'isEmailVerified',
        label: 'Email Verified',
        type: 'toggle',
        align: 'center',
        getToggleValue: ({ row }): boolean => row.isEmailVerified,
        toggleCallback: ({ value, row }): void => onEmailVerificationToggle({ userId: row.id, isEnabled: value })
      },
      {
        key: 'deletedAt',
        label: 'Deleted',
        type: 'toggle',
        align: 'center',
        getToggleValue: ({ row }): boolean => row.deletedAt === null,
        toggleCallback: ({ row }): void => onDeletedToggle({ userId: row.id })
      }
    ];
  }
}
