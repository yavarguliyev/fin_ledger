export interface AuditTokenDto {
  token: string;
}

export interface AuditPatchDto {
  path: string;
  body: object;
}

export interface AuditCreated {
  id: string;
}
