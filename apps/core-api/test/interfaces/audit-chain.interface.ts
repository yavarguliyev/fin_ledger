export interface ChainedRow {
  chainSeq: string;
  hasPrev: boolean;
}

export interface ChainEditDto {
  action: string;
  chainSeq: string;
}

export interface ChainBreak {
  chainSeq: string;
}
