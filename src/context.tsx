import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import type { ExternalReferenceAdapter, FinanceHttpClient } from './types';

export interface FinanceiroConfig { http: FinanceHttpClient; permissions: readonly string[]; references?: ExternalReferenceAdapter; basePath?: string; locale?: string; onError?: (error: unknown) => void }
interface Runtime extends FinanceiroConfig { apiPrefix: '/financeiro'; can(permission: string): boolean; path(relative?: string): string }
const Context = createContext<Runtime | null>(null);
export function resolveFinanceiroPath(basePath='/financeiro',relative='') { const base=basePath.replace(/\/$/,'');return `${base}/${relative.replace(/^\//,'')}`.replace(/\/$/,'') }

export function FinanceiroProvider({ children, ...config }: PropsWithChildren<FinanceiroConfig>) {
  const value = useMemo<Runtime>(() => ({ ...config, apiPrefix: '/financeiro', can: (permission) => config.permissions.includes(permission),path:(relative='')=>resolveFinanceiroPath(config.basePath,relative) }), [config]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFinanceiro() { const value = useContext(Context); if (!value) throw new Error('FinanceiroProvider não encontrado.'); return value; }
