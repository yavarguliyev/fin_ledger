export enum UserRoles {
  ADMIN = 'ADMIN',
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum PasswordAlgorithm {
  ARGON2ID = 'argon2id',
  BCRYPT = 'bcrypt'
}
