import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExternalReferenceInput, ModalForm, PageHeader, Permission, QueryState, Status, brl, date } from './components';
import { useFinanceDetail, useFinanceMutation } from './hooks';
import { financePermissions } from './permissions';
import { useFinancialReferences } from './domain-components';
import type { Parcelamento, ParcelamentoPagarDetail, ParcelamentoReceberDetail } from './types';
import { useFinanceiro } from './context';

type Kind = 'payable' | 'receivable';
const path = (kind: Kind) => kind === 'payable' ? '/parcelamentos-pagar' : '/parcelamentos-receber';

export function InstallmentForm({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const refs = useFinancialReferences();
  const mutation = useFinanceMutation<Parcelamento, Record<string, unknown>>('create', path(kind));
  const [mode, setMode] = useState<'AUTOMATICO' | 'PERSONALIZADO'>('AUTOMATICO');
  const [count, setCount] = useState(2); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const data = Object.fromEntries(Object.entries(raw).filter(([, value]) => String(value) !== ''));
    const payload: Record<string, unknown> = { ...data, modo: mode, quantidade_parcelas: count };
    if (mode === 'PERSONALIZADO') {
      const parcelas = Array.from({ length: count }, (_, index) => ({ numero: index + 1, valor: data[`parcela_${index}_valor`], data_vencimento: data[`parcela_${index}_vencimento`] }));
      if (Math.abs(parcelas.reduce((sum, item) => sum + Number(item.valor || 0), 0) - Number(data.valor_total)) > 0.009) { setError('A soma das parcelas personalizadas deve ser igual ao valor total.'); return; }
      payload.parcelas = parcelas; Object.keys(payload).filter((key) => key.startsWith('parcela_')).forEach((key) => delete payload[key]);
    }
    try { await mutation.mutateAsync(payload); onClose(); } catch (requestError) { setError((requestError as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Não foi possível criar o parcelamento.'); }
  }
  const party = kind === 'payable' ? { name: 'fornecedor_uuid', label: 'Fornecedor', referenceKind: 'fornecedor' as const } : { name: 'cliente_uuid', label: 'Cliente', referenceKind: 'cliente' as const };
  return <div className="fin-modal-backdrop"><section className="fin-modal fin-modal--wide" role="dialog" aria-modal="true"><h2>Novo parcelamento a {kind === 'payable' ? 'pagar' : 'receber'}</h2><form onSubmit={submit} className="fin-form-grid">
    <label>Modo<select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="AUTOMATICO">Automático</option><option value="PERSONALIZADO">Personalizado</option></select></label><label>Descrição<input name="descricao" required /></label><label>Data da negociação<input name="data_negociacao" type="date" required /></label><label>Valor total<input name="valor_total" type="number" step="0.01" required /></label><label>Quantidade de parcelas<input name="quantidade_parcelas" type="number" min="1" value={count} onChange={(event) => setCount(Math.max(1, Number(event.target.value)))} /></label>
    <label>Plano de Contas<select name="plano_conta_uuid" required><option value="">Selecione</option>{refs.plans.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Centro de Custo<select name="centro_custo_uuid"><option value="">Não informado</option>{refs.centers.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><ExternalReferenceInput field={party} />{kind === 'receivable' && <ExternalReferenceInput field={{ name: 'vendedor_uuid', label: 'Vendedor', referenceKind: 'vendedor' }} />}
    <label>Documento<input name="documento" /></label><label className="fin-span-2">Observações<textarea name="observacoes" /></label>{mode === 'AUTOMATICO' ? <><label>Primeiro vencimento<input name="primeiro_vencimento" type="date" required /></label><label>Periodicidade<select name="periodicidade" required><option value="MENSAL">Mensal</option><option value="QUINZENAL">Quinzenal</option><option value="SEMANAL">Semanal</option></select></label></> : <fieldset className="fin-span-2"><legend>Parcelas personalizadas</legend>{Array.from({ length: count }, (_, index) => <div className="fin-installment-row" key={index}><strong>{index + 1}</strong><label>Valor<input name={`parcela_${index}_valor`} type="number" step="0.01" required /></label><label>Vencimento<input name={`parcela_${index}_vencimento`} type="date" required /></label></div>)}</fieldset>}
    {error && <p className="fin-error fin-span-2" role="alert">{error}</p>}<footer className="fin-span-2"><button type="button" className="fin-secondary" onClick={onClose}>Cancelar</button><button disabled={mutation.isPending}>{mutation.isPending ? 'Criando…' : 'Criar parcelamento'}</button></footer>
  </form></section></div>;
}

export function InstallmentDetailPage({ kind }: { kind: Kind }) {
  const { uuid } = useParams(); const navigate = useNavigate(); const {path:modulePath}=useFinanceiro();
  const query = useFinanceDetail<ParcelamentoPagarDetail | ParcelamentoReceberDetail>(`${path(kind)}/${uuid}`, Boolean(uuid));
  const [editing, setEditing] = useState(false); const [canceling, setCanceling] = useState(false);
  const update = useFinanceMutation<Parcelamento, Record<string, unknown>>('update', `${path(kind)}/${uuid}`);
  const cancel = useFinanceMutation<Parcelamento, { motivo_cancelamento: string }>('action', `${path(kind)}/${uuid}/cancelar`);
  const editPermission = kind === 'payable' ? financePermissions.payableInstallment.edit : financePermissions.receivableInstallment.edit;
  const cancelPermission = kind === 'payable' ? financePermissions.payableInstallment.cancel : financePermissions.receivableInstallment.cancel;
  const item = query.data;
  return <><PageHeader title={item?.codigo ?? 'Parcelamento'} description={item?.descricao} /><QueryState loading={query.isLoading} error={query.error}>{item && <><div className="fin-kpis"><article><span>Valor total</span><strong>{brl(item.valor_total)}</strong></article><article><span>Parcelas</span><strong>{item.quantidade_parcelas}</strong></article><article><span>Negociação</span><strong>{date(item.data_negociacao)}</strong></article><article><span>Situação</span><strong><Status>{item.status}</Status></strong></article></div><section className="fin-card fin-actions"><Permission code={editPermission}><button disabled={item.status === 'CANCELADO'} onClick={() => setEditing(true)}>Editar</button></Permission><Permission code={cancelPermission}><button className="fin-danger" disabled={item.status === 'CANCELADO'} onClick={() => setCanceling(true)}>Cancelar parcelamento</button></Permission></section><section className="fin-card"><h2>Parcelas</h2><table className="fin-table"><thead><tr><th>Parcela</th><th>Descrição</th><th>Vencimento</th><th className="fin-money">Valor</th><th className="fin-money">Saldo</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{item.parcelas.map((row) => <tr key={row.uuid}><td>{row.numero_parcela ?? '—'}</td><td><button className="fin-link-button fin-text-left" onClick={() => navigate(modulePath(`${kind === 'payable' ? 'contas-pagar' : 'contas-receber'}/${row.uuid}`))}>{row.descricao}</button></td><td>{date(row.data_vencimento)}</td><td className="fin-money">{brl(row.valor_original)}</td><td className="fin-money">{brl(row.saldo_pendente)}</td><td><Status>{row.situacao_financeira}</Status></td><td><button className="fin-link-button" onClick={() => navigate(modulePath(`${kind === 'payable' ? 'contas-pagar' : 'contas-receber'}/${row.uuid}`))}>Ver conta</button></td></tr>)}</tbody></table></section></>}</QueryState>{editing && item && <ModalForm title={`Editar ${item.codigo}`} fields={[{ name: 'descricao', label: 'Descrição' }, { name: 'documento', label: 'Documento' }, { name: 'observacoes', label: 'Observações', type: 'textarea' }]} initialValues={item as unknown as Record<string, unknown>} onClose={() => setEditing(false)} onSubmit={async (data) => { await update.mutateAsync(data); await query.refetch(); }} />}{canceling && <ModalForm title="Cancelar parcelamento" fields={[{ name: 'motivo_cancelamento', label: 'Motivo', type: 'textarea', required: true }]} onClose={() => setCanceling(false)} onSubmit={async (data) => { await cancel.mutateAsync(data as { motivo_cancelamento: string }); await query.refetch(); }} />}</>;
}
