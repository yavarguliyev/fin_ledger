export interface ContactCard {
  isStaff: boolean;
  name: string | null;
  team?: string;
  userId?: string;
  role?: string;
  memberSince?: string;
  accountStatus?: string;
  kycStatus?: string;
  avatarUrl?: string | null;
}
