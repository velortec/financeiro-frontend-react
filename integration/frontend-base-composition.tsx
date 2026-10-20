import { useMemo } from 'react';
import { Route } from 'react-router-dom';
import { apiClient } from '@base/infra/http/http-client';
import { useAuth } from '@base/features/auth/auth-context';
import { createFrontendBaseReferenceAdapter, FinanceiroModule, FinanceiroNavigation } from '../src';

const roles = { supplierRole: 'FORNECEDOR', customerRole: 'CLIENTE', sellerRole: 'VENDEDOR' };

/** Elemento a inserir dentro de Routes > ProtectedRoute > AuthenticatedLayout. */
export function FrontendBaseFinanceiroRoute() {
  const auth = useAuth();
  const references = useMemo(() => createFrontendBaseReferenceAdapter(apiClient, roles), []);
  if (auth.authorizationStatus !== 'ready' || !auth.accessContext) return null;
  return <FinanceiroModule http={apiClient} permissions={auth.accessContext.permissoes} references={references} />;
}
export const frontendBaseFinanceiroRoute = <Route path="financeiro/*" element={<FrontendBaseFinanceiroRoute />} />;

/** Bloco a inserir no nav do AuthenticatedLayout; não cria outro layout. */
export function FrontendBaseFinanceiroNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const auth = useAuth();
  return <FinanceiroNavigation permissions={auth.accessContext?.permissoes ?? []} onNavigate={onNavigate} />;
}
