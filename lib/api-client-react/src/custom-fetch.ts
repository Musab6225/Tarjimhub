export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export class ApiError<T = unknown> extends Error {
  readonly status: number;
  readonly data: T | null;
  constructor(status: number, message: string, data: T | null = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tarjimhub_token') : null;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error: any = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    try { error.data = await response.json(); } catch { error.data = {}; }
    throw error;
  }
  return response.json() as Promise<T>;
};
