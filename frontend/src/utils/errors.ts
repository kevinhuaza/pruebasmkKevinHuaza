import axios from 'axios';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}

export function getErrorDetails(error: unknown): unknown[] {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { details?: unknown[] } | undefined)?.details || [];
  }
  return [];
}
