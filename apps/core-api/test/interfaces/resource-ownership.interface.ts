export interface OwnershipIdRow {
  id: string;
}

export interface OwnershipEntryRow {
  transaction_id: string;
}

export interface OwnershipTokens {
  owner: string;
  other: string;
  staff: string;
}

export interface OwnershipIds {
  payment: string;
  account: string;
  transaction: string;
  systemAccount: string;
}
