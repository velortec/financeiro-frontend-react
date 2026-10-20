import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFinanceiro } from './context';
import { createFinanceService } from './service';
import type { QueryParams } from './types';
export const financeKeys = { all: ['financeiro'] as const, list: (path: string, params?: QueryParams) => ['financeiro', path, params] as const, detail: (path: string) => ['financeiro', path] as const };
export function useFinanceList<T>(path: string, params?: QueryParams, enabled = true) { const { http } = useFinanceiro(); return useQuery({ queryKey: financeKeys.list(path, params), queryFn: () => createFinanceService(http).list<T>(path, params), enabled }); }
export function useFinanceDetail<T>(path: string, enabled = true) { const { http } = useFinanceiro(); return useQuery({ queryKey: financeKeys.detail(path), queryFn: () => createFinanceService(http).get<T>(path), enabled }); }
export function useFinanceMutation<T,D>(method: 'create'|'update'|'action', path: string, options?: { idempotency?: boolean }) { const { http, onError } = useFinanceiro(); const client = useQueryClient(); return useMutation({ mutationFn: (data: D) => { const service = createFinanceService(http); return method === 'create' ? service.create<T,D>(path, data, options?.idempotency ? crypto.randomUUID() : undefined) : method === 'update' ? service.update<T,D>(path, data) : service.action<T,D>(path, data); }, onSuccess: () => client.invalidateQueries({ queryKey: financeKeys.all }), onError: (error) => { void client.invalidateQueries({ queryKey: financeKeys.all }); onError?.(error); } }); }
