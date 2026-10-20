export type UUID = string;
export type Money = string;
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface HttpRequestConfig { security: 'bearer'; params?: QueryParams; headers?: Record<string, string> }
export interface HttpResponse<T> { data: T }
export interface FinanceHttpClient {
  get<T>(url: string, config: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T, D = unknown>(url: string, data: D, config: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T, D = unknown>(url: string, data: D, config: HttpRequestConfig): Promise<HttpResponse<T>>;
}
export interface Page<T> { items: T[]; total: number; page: number; page_size: number }
export interface ActiveRecord { uuid: UUID; codigo: string; nome: string; ativo: boolean }
export interface TipoCentroCusto extends ActiveRecord { descricao: string }
export interface CentroCusto extends ActiveRecord { descricao: string; tipo_centro_custo: TipoCentroCusto; observacoes: string }
export type NaturezaPlanoConta = 'RECEITA' | 'DESPESA' | 'MISTA';
export interface PlanoConta extends ActiveRecord { descricao: string; natureza: NaturezaPlanoConta; conta_pai_uuid: UUID | null; aceita_lancamentos: boolean; participa_dre: boolean; observacoes: string }
export interface PlanoContaNode extends PlanoConta { filhos: PlanoContaNode[] }
export interface InstituicaoFinanceira extends ActiveRecord { nome_reduzido: string; tipo_instituicao: string; codigo_compe: string; ispb: string; cnpj: string; site: string; observacoes: string }
export interface ContaFinanceira extends ActiveRecord { descricao: string; tipo_conta: string; instituicao_financeira_uuid: UUID | null; agencia: string; numero_conta: string; digito_conta: string; chave_pix: string; permite_movimentacao: boolean; movimentacao_somente_integracao: boolean; observacoes: string }
export interface FormaPagamento extends ActiveRecord { descricao: string; tipo_forma: string; permite_pagamento: boolean; permite_recebimento: boolean; ordem_exibicao: number; observacoes: string }
export interface ContaBase { uuid: UUID; codigo: string; descricao: string; documento: string; data_emissao: string | null; data_competencia: string; data_vencimento: string; valor_original: Money; plano_conta_uuid: UUID; centro_custo_uuid: UUID | null; parcelamento_uuid: UUID | null; status: string; observacoes: string; numero_parcela: number | null; ativo: boolean; saldo_pendente: Money; situacao_financeira: string; situacao_temporal: string; pode_editar: boolean; pode_cancelar: boolean }
export interface ContaPagar extends ContaBase { fornecedor_uuid: UUID | null; pode_pagar: boolean }
export interface ContaReceber extends ContaBase { cliente_uuid: UUID | null; vendedor_uuid: UUID | null; vendedor_nome: string | null; pode_receber: boolean; pode_baixar: boolean }
export interface Pagamento { uuid: UUID; codigo: string; conta_pagar_uuid: UUID; data_pagamento: string; valor_principal: Money; juros: Money; multa: Money; desconto: Money; outros_acrescimos: Money; conta_financeira_uuid: UUID; forma_pagamento_uuid: UUID; forma_pagamento_nome: string; documento: string; status: string; observacoes: string; motivo_cancelamento: string }
export interface Recebimento { uuid: UUID; codigo: string; conta_receber_uuid: UUID; conta_financeira_uuid: UUID; forma_pagamento_uuid: UUID; forma_pagamento_nome: string; data_recebimento: string; valor: Money; documento: string; observacoes: string; status: string; motivo_cancelamento: string }
export interface BaixaContaReceber { uuid: UUID; codigo: string; conta_receber_uuid: UUID; tipo_baixa: string; data_baixa: string; valor: Money; plano_conta_contrapartida_uuid: UUID; centro_custo_uuid: UUID | null; documento: string; justificativa: string; observacoes: string; status: string; motivo_cancelamento: string }
export interface Parcelamento { uuid: UUID; codigo: string; descricao: string; documento: string; data_negociacao: string; valor_total: Money; quantidade_parcelas: number; status: string; observacoes: string; motivo_cancelamento: string; ativo: boolean }
export interface ParcelamentoPagarDetail extends Parcelamento { soma_valores_originais: Money; valor_original_ativo: Money; valor_liquidado: Money; saldo_pendente: Money; parcelas_abertas: number; parcelas_canceladas: number; parcelas_quitadas: number; possui_parcelas_vencidas: boolean; parcelamento_cancelado: boolean; esta_quitado: boolean; parcelas: ContaPagar[] }
export interface ParcelamentoReceberDetail extends Parcelamento { valor_original_ativo: Money; valor_original_cancelado: Money; valor_aberto_estrutural: Money; quantidade_ativa: number; quantidade_cancelada: number; quantidade_vencida: number; parcelas: ContaReceber[] }
export interface Transferencia { uuid: UUID; codigo: string; conta_origem_uuid: UUID; conta_origem_nome: string; conta_destino_uuid: UUID; conta_destino_nome: string; data_transferencia: string; valor: Money; descricao: string; documento: string; observacoes: string; status: string; motivo_cancelamento: string; pode_cancelar: boolean }
export interface VisaoGeral { periodo_inicial: string; periodo_final: string; a_pagar_atual: Money; a_receber_atual: Money; pagamentos_no_periodo: Money; recebimentos_no_periodo: Money; contas_pagar_prioritarias: ContaPagar[]; contas_receber_prioritarias: ContaReceber[] }
export type NaturezaFluxoCaixa = 'ENTRADA' | 'SAIDA';
export interface LinhaFluxoCaixa { descricao: string; contraparte_nome: string | null; data: string; origem: string; origem_uuid: UUID; tipo_evento: string; natureza: NaturezaFluxoCaixa | null; afeta_saldo: boolean; valor: Money; saldo: Money; documento: string; status: string }
export interface FluxoCaixa { periodo_inicial: string; periodo_final: string | null; saldo_inicial: Money; total_entradas: Money; total_saidas: Money; saldo_final: Money; linhas: LinhaFluxoCaixa[] }
export interface GrupoDre { plano_conta: PlanoConta; valor: Money; filhos: GrupoDre[] }
export interface Dre { periodo_inicial: string | null; periodo_final: string | null; grupos: GrupoDre[] }
export interface DreDetailItem { origem:string; origem_uuid:UUID; origem_codigo:string|null; tipo_evento:string; data_evento:string; descricao:string; valor:Money; plano_conta:PlanoConta; centro_custo:Record<string,unknown>|null; documento:string }
export interface DreDetail { plano_conta:PlanoConta; periodo_inicial:string|null; periodo_final:string|null; centro_custo_uuid:UUID|null; items:DreDetailItem[]; total:number; page:number; page_size:number; valor_total:Money }
export interface NavigationItem { label: string; to: string; permission: string }
export interface NavigationGroup { id: string; label: string; items: NavigationItem[] }
export type ExternalReferenceKind = 'fornecedor' | 'cliente' | 'vendedor' | 'unidade_operacional';
export interface ExternalReference { uuid: UUID; codigo?: string; nome: string; descricao?: string }
export interface ExternalReferenceRequest { kind: ExternalReferenceKind; page: number; pageSize: number; search?: string }
export interface ExternalReferenceAdapter { search(request: ExternalReferenceRequest): Promise<Page<ExternalReference>> }
