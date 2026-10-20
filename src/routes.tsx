import { Navigate, type RouteObject } from 'react-router-dom';
import { CashFlowPage, DrePage, InstallmentsPage, MovementsPage, ObligationDetailPage, ObligationsPage, OverviewPage, RegistrationsPage, TransfersPage } from './pages';
import { financePermissions, registrationPermission } from './permissions';
import type { NavigationGroup, NavigationItem } from './types';
import { InstallmentDetailPage } from './installments';
import { DreAnalysisPage } from './analytics';
import { useFinanceiro } from './context';
import { FinanceiroSettingsPage } from './settings';

function normalizeBasePath(basePath: string) {
  const normalized = `/${basePath}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalized || '/financeiro';
}

function FinanceiroEntry() {
  const { permissions, basePath = '/financeiro' } = useFinanceiro();
  if (permissions.includes(financePermissions.overview)) return <OverviewPage />;
  const destination = getFinanceiroNavigation(permissions, basePath)[0];
  return destination
    ? <Navigate to={destination.to} replace />
    : <section className="fin-state fin-error"><h2>Acesso negado</h2><p>Seu perfil não possui permissão de consulta financeira.</p></section>;
}

export const financeiroRoutes: RouteObject[] = [
  { index: true, element: <FinanceiroEntry/> },
  { path: 'contas-pagar', element: <ObligationsPage kind="payable"/> },
  { path: 'contas-pagar/:uuid', element: <ObligationDetailPage kind="payable"/> },
  { path: 'pagamentos', element: <MovementsPage kind="payments"/> },
  { path: 'parcelamentos-pagar', element: <InstallmentsPage kind="payable"/> },
  { path: 'parcelamentos-pagar/:uuid', element: <InstallmentDetailPage kind="payable"/> },
  { path: 'contas-receber', element: <ObligationsPage kind="receivable"/> },
  { path: 'contas-receber/:uuid', element: <ObligationDetailPage kind="receivable"/> },
  { path: 'recebimentos', element: <MovementsPage kind="receipts"/> },
  { path: 'baixas-contas-receber', element: <MovementsPage kind="writeoffs"/> },
  { path: 'parcelamentos-receber', element: <InstallmentsPage kind="receivable"/> },
  { path: 'parcelamentos-receber/:uuid', element: <InstallmentDetailPage kind="receivable"/> },
  { path: 'transferencias', element: <TransfersPage/> },
  { path: 'fluxo-caixa', element: <CashFlowPage/> },
  { path: 'dre', element: <DreAnalysisPage/> },
  { path: 'configuracoes', element: <FinanceiroSettingsPage/> },
  { path: 'cadastros/tipos-centro-custo', element: <RegistrationsPage kind="tipos-centro-custo"/> },
  { path: 'cadastros/centros-custo', element: <RegistrationsPage kind="centros-custo"/> },
  { path: 'cadastros/planos-conta', element: <RegistrationsPage kind="planos-conta"/> },
  { path: 'cadastros/instituicoes-financeiras', element: <RegistrationsPage kind="instituicoes-financeiras"/> },
  { path: 'cadastros/contas-financeiras', element: <RegistrationsPage kind="contas-financeiras"/> },
  { path: 'cadastros/formas-pagamento', element: <RegistrationsPage kind="formas-pagamento"/> },
];

export const financeiroNavigation: NavigationItem[] = [
  {label:'Visão geral',to:'/financeiro',permission:financePermissions.overview}, {label:'Contas a pagar',to:'/financeiro/contas-pagar',permission:financePermissions.payable.read},
  {label:'Pagamentos',to:'/financeiro/pagamentos',permission:financePermissions.payment.read}, {label:'Parcelamentos a pagar',to:'/financeiro/parcelamentos-pagar',permission:financePermissions.payableInstallment.read},
  {label:'Contas a receber',to:'/financeiro/contas-receber',permission:financePermissions.receivable.read}, {label:'Recebimentos',to:'/financeiro/recebimentos',permission:financePermissions.receipt.read},
  {label:'Baixas',to:'/financeiro/baixas-contas-receber',permission:financePermissions.writeOff.read}, {label:'Parcelamentos a receber',to:'/financeiro/parcelamentos-receber',permission:financePermissions.receivableInstallment.read},
  {label:'Transferências',to:'/financeiro/transferencias',permission:financePermissions.transfer.read}, {label:'Fluxo de caixa',to:'/financeiro/fluxo-caixa',permission:financePermissions.cashFlow}, {label:'DRE',to:'/financeiro/dre',permission:financePermissions.dre},
  ...([['Tipos de Centro de Custo','tipos-centro-custo',financePermissions.registrations.costCenterType],['Centros de Custo','centros-custo',financePermissions.registrations.costCenter],['Plano de Contas','planos-conta',financePermissions.registrations.accountPlan],['Instituições Financeiras','instituicoes-financeiras',financePermissions.registrations.institution],['Contas Financeiras','contas-financeiras',financePermissions.registrations.financialAccount],['Formas de Pagamento','formas-pagamento',financePermissions.registrations.paymentMethod]] as const).map(([label,path,resource])=>({label,to:`/financeiro/cadastros/${path}`,permission:registrationPermission(resource,'consultar')})),
];

const settingsPermissions = financeiroNavigation.filter(item => item.to.startsWith('/financeiro/cadastros/')).map(item => item.permission);

/** Destinos funcionais de primeiro nível, alinhados à experiência operacional do Sedex. */
export function getFinanceiroPrimaryNavigation(permissions: readonly string[], basePath='/financeiro'): NavigationItem[] {
  const normalized = normalizeBasePath(basePath);
  const candidates: NavigationItem[] = [
    { label: 'Visão Geral', to: normalized, permission: financePermissions.overview },
    { label: 'Contas a Pagar', to: `${normalized}/contas-pagar`, permission: financePermissions.payable.read },
    { label: 'Contas a Receber', to: `${normalized}/contas-receber`, permission: financePermissions.receivable.read },
    { label: 'Transferências', to: `${normalized}/transferencias`, permission: financePermissions.transfer.read },
    { label: 'Fluxo de Caixa', to: `${normalized}/fluxo-caixa`, permission: financePermissions.cashFlow },
    { label: 'DRE', to: `${normalized}/dre`, permission: financePermissions.dre },
  ];
  const visible = candidates.filter(item => permissions.includes(item.permission));
  const firstSettingPermission = settingsPermissions.find(permission => permissions.includes(permission));
  if (firstSettingPermission) visible.push({ label: 'Configurações', to: `${normalized}/configuracoes`, permission: firstSettingPermission });
  return visible;
}

const navigationGroupIds = {
  overview: new Set(['/financeiro']),
  operations: new Set(['/financeiro/contas-pagar', '/financeiro/pagamentos', '/financeiro/parcelamentos-pagar', '/financeiro/contas-receber', '/financeiro/recebimentos', '/financeiro/baixas-contas-receber', '/financeiro/parcelamentos-receber', '/financeiro/transferencias']),
  analytics: new Set(['/financeiro/fluxo-caixa', '/financeiro/dre']),
};

export function getFinanceiroNavigation(permissions: readonly string[], basePath='/financeiro') {
  const normalizedBasePath = normalizeBasePath(basePath);
  return financeiroNavigation.filter(item => permissions.includes(item.permission)).map(item => ({ ...item, to: item.to.replace('/financeiro', normalizedBasePath) }));
}

export function getFinanceiroNavigationGroups(permissions: readonly string[], basePath='/financeiro'): NavigationGroup[] {
  const authorized = getFinanceiroNavigation(permissions, basePath);
  const originalByPermission = new Map(financeiroNavigation.map(item => [item.permission, item.to]));
  const select = (paths: Set<string>) => authorized.filter(item => paths.has(originalByPermission.get(item.permission) ?? ''));
  return [
    { id: 'overview', label: 'Visão geral', items: select(navigationGroupIds.overview) },
    { id: 'operations', label: 'Operações financeiras', items: select(navigationGroupIds.operations) },
    { id: 'analytics', label: 'Análises', items: select(navigationGroupIds.analytics) },
    { id: 'registrations', label: 'Cadastros financeiros', items: authorized.filter(item => (originalByPermission.get(item.permission) ?? '').startsWith('/financeiro/cadastros/')) },
  ].filter(group => group.items.length > 0);
}

/** Único destino que deve ser incorporado à navegação global da aplicação consumidora. */
export function getFinanceiroGlobalDestination(permissions: readonly string[], basePath='/financeiro'): NavigationItem | null {
  const firstAuthorized = getFinanceiroNavigation(permissions, basePath)[0];
  return firstAuthorized ? { label: 'Financeiro', to: normalizeBasePath(basePath), permission: firstAuthorized.permission } : null;
}
