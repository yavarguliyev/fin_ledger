export interface DataTransferFakeDto {
  types: string[];
  files: File[];
}

export interface DragTypesFakeDto {
  types: string[];
}

export interface DragEventFakeDto extends DataTransferFakeDto {
  preventDefault: () => void;
}

export interface MouseEventFakeDto {
  target: object;
}
