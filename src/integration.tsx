import { NavLink, useRoutes } from 'react-router-dom';
import { FinanceiroProvider, type FinanceiroConfig } from './context';
import { financeiroRoutes, getFinanceiroNavigation } from './routes';

/** Elemento para a rota consumidora `financeiro/*`; reutiliza Router e QueryClient existentes. */
export function FinanceiroModule(props: FinanceiroConfig) {
  return <FinanceiroProvider {...props}><FinanceiroRouteOutlet /></FinanceiroProvider>;
}
export function FinanceiroRouteOutlet() { return useRoutes(financeiroRoutes); }

/** Navegação pronta para ser inserida no nav do AuthenticatedLayout do consumidor. */
export function FinanceiroNavigation({ permissions, onNavigate, basePath }: { permissions: readonly string[]; onNavigate?: () => void; basePath?: string }) {
  const items = getFinanceiroNavigation(permissions, basePath);
  if (!items.length) return null;
  return <div className="fin-navigation"><strong>Financeiro</strong>{items.map((item) => <NavLink key={item.to} to={item.to} onClick={onNavigate}>{item.label}</NavLink>)}</div>;
}
