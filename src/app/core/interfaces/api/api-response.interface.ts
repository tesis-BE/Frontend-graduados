export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown> | null;
}
