import { Link } from 'react-router-dom';
import { PageHeader } from './components';
import { financePermissions, registrationPermission } from './permissions';
import { useFinanceiro } from './context';

const settings = [
  { label: 'Tipos de Centro de Custo', description: 'Classificações utilizadas para organizar centros de custo.', path: 'tipos-centro-custo', permission: registrationPermission(financePermissions.registrations.costCenterType, 'consultar') },
  { label: 'Centros de Custo', description: 'Unidades de apropriação e análise financeira.', path: 'centros-custo', permission: registrationPermission(financePermissions.registrations.costCenter, 'consultar') },
  { label: 'Plano de Contas', description: 'Estrutura de classificação financeira e gerencial.', path: 'planos-conta', permission: registrationPermission(financePermissions.registrations.accountPlan, 'consultar') },
  { label: 'Instituições Financeiras', description: 'Bancos e instituições vinculadas às contas financeiras.', path: 'instituicoes-financeiras', permission: registrationPermission(financePermissions.registrations.institution, 'consultar') },
  { label: 'Contas Financeiras', description: 'Caixas, contas bancárias e origens ou destinos de recursos.', path: 'contas-financeiras', permission: registrationPermission(financePermissions.registrations.financialAccount, 'consultar') },
  { label: 'Formas de Pagamento', description: 'Formas utilizadas nos pagamentos e recebimentos.', path: 'formas-pagamento', permission: registrationPermission(financePermissions.registrations.paymentMethod, 'consultar') },
] as const;

export function FinanceiroSettingsPage() {
  const { can, path } = useFinanceiro();
  const visible = settings.filter(item => can(item.permission));
  return <><PageHeader title="Configurações do Financeiro" description="Cadastros estruturais utilizados nas operações financeiras."/><section className="fin-settings-grid">{visible.map(item => {const resource=item.permission.replace(/\.consultar$/,'');const canManage=['criar','editar','ativar','desativar'].some(action=>can(`${resource}.${action}`));return <article className="fin-card" key={item.path}><h2>{item.label}</h2><p>{item.description}</p><Link className="fin-link" to={path(`cadastros/${item.path}`)}>{canManage?'Gerenciar':'Consultar'}</Link></article>})}</section></>;
}
