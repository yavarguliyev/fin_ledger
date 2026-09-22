import { AdminUser } from '../../../core/interfaces/admin/admin-user.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';

export class AdminHelper {
  static getAdminTableColumns (
    onStatusToggle: (walletId: string | null, isActive: boolean) => void,
    onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
    onDeletedToggle: (userId: string, isDeleted: boolean) => void,
    onView: (userId: string) => void,
    onAnonymize: (userId: string) => void,
    isGlobalAdmin: boolean
  ): TableColumn<AdminUser>[] {
    return [
      ...AdminHelper.createBaseColumns(),
      ...AdminHelper.createToggleColumns(onStatusToggle, onEmailVerificationToggle, onDeletedToggle),
      AdminHelper.createActionsColumn(onView, onAnonymize, isGlobalAdmin)
    ];
  }

  static formatCurrencyCompact (amountMinor: number): string {
    return CurrencyHelper.formatCurrencyCompact(amountMinor, 'USD');
  }

  private static createActionsColumn (onView: (userId: string) => void, onAnonymize: (userId: string) => void, showDelete: boolean): TableColumn<AdminUser> {
    return {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'center',
      actions: {
        view: true,
        update: false,
        delete: showDelete,
        deleteLabel: 'Anonymize user',
        onView: (row: AdminUser): void => {
          onView(row.id);
        },
        onDelete: (row: AdminUser): void => {
          onAnonymize(row.id);
        }
      }
    };
  }

  private static createBaseColumns (): TableColumn<AdminUser>[] {
    return [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        align: 'center'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text',
        align: 'center'
      },
      {
        key: 'role',
        label: 'Role',
        type: 'badge',
        align: 'center',
        badgeClass: (): string => 'bg-primary/10 text-primary capitalize',
        format: (value: unknown): string => {
          const role = String(value);
          return role.charAt(0).toUpperCase() + role.slice(1);
        }
      },
      {
        key: 'balance',
        label: 'Balance',
        type: 'currency',
        align: 'center',
        format: (value: unknown, row: AdminUser): string => CurrencyHelper.formatCurrency(Number(value), row.currency)
      }
    ];
  }

  private static createToggleColumns (
    onStatusToggle: (walletId: string | null, isActive: boolean) => void,
    onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
    onDeletedToggle: (userId: string, isDeleted: boolean) => void
  ): TableColumn<AdminUser>[] {
    return [
      {
        key: 'status',
        label: 'Wallet Status',
        type: 'toggle',
        align: 'center',
        getToggleValue: (row: AdminUser): boolean => row.status?.toUpperCase() === 'ACTIVE',
        toggleCallback: (checked: boolean, row: AdminUser): void => onStatusToggle(row.walletId, checked)
      },
      {
        key: 'isEmailVerified',
        label: 'Email Verified',
        type: 'toggle',
        align: 'center',
        getToggleValue: (row: AdminUser): boolean => row.isEmailVerified,
        toggleCallback: (checked: boolean, row: AdminUser): void => onEmailVerificationToggle(row.id, checked)
      },
      {
        key: 'deletedAt',
        label: 'Deleted',
        type: 'toggle',
        align: 'center',
        getToggleValue: (row: AdminUser): boolean => row.deletedAt === null,
        toggleCallback: (checked: boolean, row: AdminUser): void => onDeletedToggle(row.id, checked)
      }
    ];
  }
}
