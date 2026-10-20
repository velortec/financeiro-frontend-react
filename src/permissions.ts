export const financePermissions = {
  overview: 'financeiro.resumo_financeiro.consultar', cashFlow: 'financeiro.fluxo_caixa.consultar', dre: 'financeiro.dre.consultar',
  payable: { read: 'financeiro.conta_pagar.consultar', create: 'financeiro.conta_pagar.criar', edit: 'financeiro.conta_pagar.editar', cancel: 'financeiro.conta_pagar.cancelar' },
  receivable: { read: 'financeiro.conta_receber.consultar', create: 'financeiro.conta_receber.criar', edit: 'financeiro.conta_receber.editar', cancel: 'financeiro.conta_receber.cancelar' },
  payment: { read: 'financeiro.pagamento.consultar', create: 'financeiro.pagamento.criar', edit: 'financeiro.pagamento.editar', cancel: 'financeiro.pagamento.cancelar' },
  receipt: { read: 'financeiro.recebimento.consultar', create: 'financeiro.recebimento.criar', edit: 'financeiro.recebimento.editar', cancel: 'financeiro.recebimento.cancelar' },
  writeOff: { read: 'financeiro.baixa_conta_receber.consultar', create: 'financeiro.baixa_conta_receber.criar', edit: 'financeiro.baixa_conta_receber.editar', cancel: 'financeiro.baixa_conta_receber.cancelar' },
  transfer: { read: 'financeiro.transferencia.consultar', create: 'financeiro.transferencia.criar', cancel: 'financeiro.transferencia.cancelar' },
  payableInstallment: { read: 'financeiro.parcelamento_pagar.consultar', create: 'financeiro.parcelamento_pagar.criar', edit: 'financeiro.parcelamento_pagar.editar', cancel: 'financeiro.parcelamento_pagar.cancelar' },
  receivableInstallment: { read: 'financeiro.parcelamento_receber.consultar', create: 'financeiro.parcelamento_receber.criar', edit: 'financeiro.parcelamento_receber.editar', cancel: 'financeiro.parcelamento_receber.cancelar' },
  registrations: {
    costCenterType: 'financeiro.tipo_centro_custo', costCenter: 'financeiro.centro_custo', accountPlan: 'financeiro.plano_conta',
    institution: 'financeiro.instituicao_financeira', financialAccount: 'financeiro.conta_financeira', paymentMethod: 'financeiro.forma_pagamento',
  },
} as const;

export const registrationPermission = (resource: string, action: 'consultar'|'criar'|'editar'|'ativar'|'desativar') => `${resource}.${action}`;
