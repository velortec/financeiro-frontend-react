import type { FinanceHttpClient, Page, QueryParams } from './types';
const security = { security: 'bearer' as const };
const config = (params?: QueryParams, headers?: Record<string,string>) => ({ ...security, params, headers });
const cleanCreatePayload = <D,>(data: D): D => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  return Object.fromEntries(Object.entries(data as Record<string, unknown>).filter(([, value]) => value !== '')) as D;
};
export function createFinanceService(http: FinanceHttpClient) {
  const prefix = '/financeiro';
  return {
    list: async <T>(path: string, params?: QueryParams) => (await http.get<Page<T>>(`${prefix}${path}`, config(params))).data,
    get: async <T>(path: string) => (await http.get<T>(`${prefix}${path}`, config())).data,
    create: async <T,D>(path: string, data: D, idempotencyKey?: string) => (await http.post<T,D>(`${prefix}${path}`, cleanCreatePayload(data), config(undefined, idempotencyKey ? {'Idempotency-Key': idempotencyKey} : undefined))).data,
    update: async <T,D>(path: string, data: D) => (await http.patch<T,D>(`${prefix}${path}`, data, config())).data,
    action: async <T,D = Record<string, never>>(path: string, data = {} as D) => (await http.post<T,D>(`${prefix}${path}`, data, config())).data,
  };
}
