import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@base/features/auth/AuthProvider';
import { useAuth } from '@base/features/auth/auth-context';
import { LoginPage } from '@base/features/auth/LoginPage';
import { ToastProvider } from '@base/components/notifications/ToastProvider';
import { queryClient } from '@base/app/query-client';
import { ProtectedRoute } from '@base/routes/ProtectedRoute';
import { AuthenticatedLayout } from '@base/layouts/AuthenticatedLayout';
import { HomePage } from '@base/pages/HomePage';
import { apiClient } from '@base/infra/http/http-client';
import {
  createFrontendBaseReferenceAdapter,
  FinanceiroModule,
  FinanceiroNavigation,
} from '@velortec/financeiro-react';
import '@base/styles.css';
import '@velortec/financeiro-react/styles.css';

const roles = { supplierRole: 'FORNECEDOR', customerRole: 'CLIENTE', sellerRole: 'VENDEDOR' };

function FinanceiroRoute() {
  const auth = useAuth();
  const references = useMemo(() => createFrontendBaseReferenceAdapter(apiClient, roles), []);
  if (auth.authorizationStatus !== 'ready' || !auth.accessContext) return null;
  return <FinanceiroModule http={apiClient} permissions={auth.accessContext.permissoes} references={references} />;
}

/** Injeta apenas a extensão pública de navegação no nav real do layout, sem copiar o layout-base. */
function FinanceiroNavigationSlot() {
  const auth = useAuth();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const findTarget = () => setTarget(document.querySelector<HTMLElement>('.sidebar nav'));
    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return target ? createPortal(<FinanceiroNavigation permissions={auth.accessContext?.permissoes ?? []} />, target) : null;
}

function IntegratedLayout() {
  return <><AuthenticatedLayout /><FinanceiroNavigationSlot /></>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/integration/frontend-base.html" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<IntegratedLayout />}>
            <Route index element={<HomePage />} />
            <Route path="financeiro/*" element={<FinanceiroRoute />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
