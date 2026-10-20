import { NavLink, useLocation, useRoutes } from 'react-router-dom';
import { FinanceiroProvider, type FinanceiroConfig } from './context';
import { financeiroRoutes, getFinanceiroGlobalDestination, getFinanceiroPrimaryNavigation } from './routes';
import { financePermissions } from './permissions';

/** Elemento para a rota consumidora `financeiro/*`; reutiliza Router e QueryClient existentes. */
export function FinanceiroModule(props: FinanceiroConfig) {
  return <FinanceiroProvider {...props}><div className="fin-module"><FinanceiroContextNavigation permissions={props.permissions} basePath={props.basePath}/><main className="fin-content"><FinanceiroRouteOutlet /></main></div></FinanceiroProvider>;
}
export function FinanceiroRouteOutlet() { return useRoutes(financeiroRoutes); }

/** Destino único pronto para ser inserido no nav do AuthenticatedLayout do consumidor. */
export function FinanceiroNavigation({ permissions, onNavigate, basePath }: { permissions: readonly string[]; onNavigate?: () => void; basePath?: string }) {
  const item = getFinanceiroGlobalDestination(permissions, basePath);
  if (!item) return null;
  return <div className="fin-navigation"><NavLink to={item.to} onClick={onNavigate}>{item.label}</NavLink></div>;
}

export function FinanceiroContextNavigation({ permissions, basePath }: { permissions: readonly string[]; basePath?: string }) {
  const items = getFinanceiroPrimaryNavigation(permissions, basePath);
  const location = useLocation();
  const root = (basePath ?? '/financeiro').replace(/\/$/, '');
  const inPayableInstallments = location.pathname.startsWith(`${root}/parcelamentos-pagar`);
  const inReceivableInstallments = location.pathname.startsWith(`${root}/parcelamentos-receber`);
  const payableContext = (location.pathname.startsWith(`${root}/contas-pagar`) || inPayableInstallments) && permissions.includes(financePermissions.payableInstallment.read);
  const receivableContext = (location.pathname.startsWith(`${root}/contas-receber`) || inReceivableInstallments) && permissions.includes(financePermissions.receivableInstallment.read);
  if (!items.length) return null;
  return <><nav className="fin-context-navigation" aria-label="Navegação do Financeiro">{items.map(item => <NavLink key={item.to} to={item.to} end={item.to===root} className={({isActive})=>isActive?'is-active':undefined}>{item.label}</NavLink>)}</nav>{(payableContext||receivableContext)&&<nav className="fin-subcontext-navigation" aria-label="Navegação contextual de parcelamentos">{payableContext&&<NavLink to={inPayableInstallments?`${root}/contas-pagar`:`${root}/parcelamentos-pagar`}>{inPayableInstallments?'Voltar para Contas a Pagar':'Parcelamentos a pagar'}</NavLink>}{receivableContext&&<NavLink to={inReceivableInstallments?`${root}/contas-receber`:`${root}/parcelamentos-receber`}>{inReceivableInstallments?'Voltar para Contas a Receber':'Parcelamentos a receber'}</NavLink>}</nav>}</>;
}
