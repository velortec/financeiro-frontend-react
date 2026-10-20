import type { RouteObject } from 'react-router-dom';
import { CashFlowPage, DrePage, InstallmentsPage, MovementsPage, ObligationDetailPage, ObligationsPage, OverviewPage, RegistrationsPage, TransfersPage } from './pages';
import { financePermissions, registrationPermission } from './permissions';
import type { NavigationItem } from './types';
import { InstallmentDetailPage } from './installments';
import { DreAnalysisPage } from './analytics';

export const financeiroRoutes: RouteObject[] = [
  { index: true, element: <OverviewPage/> },
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

export function getFinanceiroNavigation(permissions: readonly string[], basePath='/financeiro') { return financeiroNavigation.filter(item=>permissions.includes(item.permission)).map(item=>({...item,to:item.to.replace('/financeiro',basePath)})); }
