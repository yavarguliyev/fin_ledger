export interface ReadinessBody {
  status: string;
  info: Record<string, { status: string; totalCount: number }>;
}
