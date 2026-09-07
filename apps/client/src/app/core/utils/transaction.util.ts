export const formatType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const statusClass = (status: string): string => {
  const map: Record<string, string> = {
    COMPLETED: 'bg-success/10 text-success',
    PENDING: 'bg-warning/10 text-warning',
    FAILED: 'bg-danger/10 text-danger',
    CANCELLED: 'bg-ink-100 text-ink-500'
  };

  return map[status] ?? 'bg-ink-100 text-ink-500';
};

export const typeIcon = (type: string): string => {
  const map: Record<string, string> = {
    DEPOSIT: '↓',
    WITHDRAWAL: '↑',
    BET: '🎯',
    WINNING: '🏆',
    CREDIT: '+',
    DEBIT: '−',
    CONVERSION_IN: '🔄',
    CONVERSION_OUT: '🔄'
  };

  return map[type] ?? '•';
};

export const typeClass = (type: string): string => {
  const map: Record<string, string> = {
    DEPOSIT: 'bg-success/10 text-success',
    WITHDRAWAL: 'bg-danger/10 text-danger',
    BET: 'bg-primary/10 text-primary',
    WINNING: 'bg-warning/10 text-warning',
    CREDIT: 'bg-success/10 text-success',
    DEBIT: 'bg-danger/10 text-danger',
    CONVERSION_IN: 'bg-info/10 text-info',
    CONVERSION_OUT: 'bg-info/10 text-info'
  };

  return map[type] ?? 'bg-ink-100 text-ink-500';
};
