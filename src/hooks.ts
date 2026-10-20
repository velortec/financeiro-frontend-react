import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFinanceiro } from './context';
import { createFinanceService } from './service';
import type { QueryParams } from './types';
export const financeKeys = { all: ['financeiro'] as const, list: (path: string, params?: QueryParams) => ['financeiro', path, params] as const, detail: (path: string) => ['financeiro', path] as const };
function intentFingerprint(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(intentFingerprint).join(',')}]`;
  return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${intentFingerprint(item)}`).join(',')}}`;
}
export function createIdempotencyIntentTracker(createKey: () => string = () => crypto.randomUUID()) {
  let current: { fingerprint: string; key: string } | undefined;
  return {
    keyFor(data: unknown) {
      const fingerprint = intentFingerprint(data);
      if (!current || current.fingerprint !== fingerprint) current = { fingerprint, key: createKey() };
      return current.key;
    },
    complete() { current = undefined; },
  };
}
export function useFinanceList<T>(path: string, params?: QueryParams, enabled = true) { const { http } = useFinanceiro(); return useQuery({ queryKey: financeKeys.list(path, params), queryFn: () => createFinanceService(http).list<T>(path, params), enabled }); }
export function useFinanceDetail<T>(path: string, enabled = true) { const { http } = useFinanceiro(); return useQuery({ queryKey: financeKeys.detail(path), queryFn: () => createFinanceService(http).get<T>(path), enabled }); }
export function useFinanceMutation<T,D>(method: 'create'|'update'|'action', path: string, options?: { idempotency?: boolean }) { const { http, onError } = useFinanceiro(); const client = useQueryClient(); const intent = useRef<ReturnType<typeof createIdempotencyIntentTracker>>(); if (!intent.current) intent.current = createIdempotencyIntentTracker(); return useMutation({ mutationFn: (data: D) => { const service = createFinanceService(http); return method === 'create' ? service.create<T,D>(path, data, options?.idempotency ? intent.current?.keyFor(data) : undefined) : method === 'update' ? service.update<T,D>(path, data) : service.action<T,D>(path, data); }, onSuccess: () => { intent.current?.complete(); return client.invalidateQueries({ queryKey: financeKeys.all }); }, onError: (error) => { void client.invalidateQueries({ queryKey: financeKeys.all }); onError?.(error); } }); }
