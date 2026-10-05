export interface DeviceSignInDto {
  email: string;
  deviceId: string;
}

export interface DeviceEmailDto {
  email: string;
}

export interface DeviceCountDto {
  sql: string;
  email: string;
}

export interface DeviceCountRow {
  count: number;
}
