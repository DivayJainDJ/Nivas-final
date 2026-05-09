export class ApiError extends Error {
  constructor(
    public code: number,
    public error: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
