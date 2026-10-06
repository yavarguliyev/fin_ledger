export interface ChangeStatusDto {
  action: string;
  token?: string;
  id?: string;
}

export interface UserStatusPathDto {
  id: string;
  action: string;
}

export interface UserStatusBody {
  status: string;
}

export interface AdminUserRow {
  id: string;
  user_status: string;
  status: string | null;
}
