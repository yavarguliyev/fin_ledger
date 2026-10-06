export interface AuditLogPageRow {
  id: string;
  createdAt: string;
}

export interface AuditLogPageQuery {
  query: Record<string, string>;
}

export interface AuditLogPageCursor {
  row: AuditLogPageRow | undefined;
}

export interface AuditLogIdRow {
  id: string;
}
