import { TableColumn } from '../../core/models/data-table.model';
import { AdminUser } from '../../core/models/admin.model';
import { formatCurrency, formatCurrencyCompact as formatCompact } from '../../core/helpers/currency.helper';

const createActionsColumn = (onView: (userId: string) => void, onAnonymize: (userId: string) => void, showDelete: boolean): TableColumn<AdminUser> => ({
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
    format: (value: unknown, row: AdminUser): string => formatCurrency(Number(value), row.currency)
  }
];

const createToggleColumns = (
  onStatusToggle: (walletId: string | null, isActive: boolean) => void,
  onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
  onDeletedToggle: (userId: string, isDeleted: boolean) => void
): TableColumn<AdminUser>[] => [
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

export const getAdminTableColumns = (
  onStatusToggle: (walletId: string | null, isActive: boolean) => void,
  onEmailVerificationToggle: (userId: string, isVerified: boolean) => void,
  onDeletedToggle: (userId: string, isDeleted: boolean) => void,
  onView: (userId: string) => void,
  onAnonymize: (userId: string) => void,
  isGlobalAdmin: boolean
): TableColumn<AdminUser>[] => [
  ...createBaseColumns(),
  ...createToggleColumns(onStatusToggle, onEmailVerificationToggle, onDeletedToggle),
  createActionsColumn(onView, onAnonymize, isGlobalAdmin)
];

export const formatCurrencyCompact = (amountMinor: number): string => formatCompact(amountMinor, 'USD');
