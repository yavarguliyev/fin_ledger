export interface HttpRequestErrorDto {
  message: string;
  status: number;
  fieldErrors?: Readonly<Record<string, string>>;
  silent?: boolean;
}
