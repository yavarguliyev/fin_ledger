import { TableColumn } from '../../core/models/data-table.model';
import { AdminUser } from '../../core/models/admin.model';
import { formatCurrency, formatCurrencyCompact as formatCompact } from '../../core/utils/currency.util';

const createActionsColumn = (onView: (userId: string) => void, onDelete: (userId: string) => void, showDelete: boolean): TableColumn<AdminUser> => ({
  key: 'actions',
  label: 'Actions',
  type: 'actions',
  align: 'center',
  actions: {
    view: true,
    update: false,
    delete: showDelete,
    onView: (row: AdminUser): void => {
      onView(row.id);
    },
    onDelete: (row: AdminUser): void => {
      onDelete(row.id);
    }
  }
});

const createBaseColumns = (): TableColumn<AdminUser>[] => [
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
    format: (value: unknown): string => formatCurrency(Number(value), 'USD')
  }
];

const createToggleColumns = (
  onStatusToggle: (userId: string, isActive: boolean) => void,
  onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
  onDeletedToggle: (userId: string, isDeleted: boolean) => void
): TableColumn<AdminUser>[] => [
  {
    key: 'status',
    label: 'Wallet Status',
    type: 'toggle',
    align: 'center',
    getToggleValue: (row: AdminUser): boolean => row.status?.toUpperCase() === 'ACTIVE',
    toggleCallback: (checked: boolean, row: AdminUser): void => onStatusToggle(row.id, checked)
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

export const getAdminTableColumns = (
  onStatusToggle: (userId: string, isActive: boolean) => void,
  onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
  onDeletedToggle: (userId: string, isDeleted: boolean) => void,
  onView: (userId: string) => void,
  onDelete: (userId: string) => void,
  isGlobalAdmin: boolean
): TableColumn<AdminUser>[] => [
  ...createBaseColumns(),
  ...createToggleColumns(onStatusToggle, onEmailVerificationToggle, onDeletedToggle),
  createActionsColumn(onView, onDelete, isGlobalAdmin)
];

export const formatCurrencyCompact = (amountMinor: number): string => formatCompact(amountMinor, 'USD');
