import type { ExternalReferenceAdapter, ExternalReferenceKind, FinanceHttpClient, Page } from './types';

interface BasePerson { uuid: string; nome: string; nome_fantasia_apelido?: string; cpf_cnpj?: string }
interface BaseOperationalUnit { uuid: string; codigo: string; nome: string }
export interface FrontendBaseReferenceOptions { supplierRole: string; customerRole: string; sellerRole: string }

/** Adapta os endpoints públicos do backend-base sem importar arquivos privados do consumidor. */
export function createFrontendBaseReferenceAdapter(http: FinanceHttpClient, roles: FrontendBaseReferenceOptions): ExternalReferenceAdapter {
  const roleByKind: Record<Exclude<ExternalReferenceKind, 'unidade_operacional'>, string> = { fornecedor: roles.supplierRole, cliente: roles.customerRole, vendedor: roles.sellerRole };
  return {
    async search({ kind, page, pageSize, search }) {
      if (kind === 'unidade_operacional') {
        const response = await http.get<Page<BaseOperationalUnit>>('/referencias/unidades-operacionais', { security: 'bearer', params: { page, page_size: pageSize, busca: search } });
        return { ...response.data, items: response.data.items.map((item) => ({ uuid: item.uuid, codigo: item.codigo, nome: item.nome })) };
      }
      const response = await http.get<Page<BasePerson>>('/referencias/pessoas', {
        security: 'bearer',
        params: { papel: roleByKind[kind], busca: search, page, page_size: pageSize },
      });
      return { ...response.data, items: response.data.items.map((item) => ({ uuid: item.uuid, nome: item.nome, descricao: item.nome_fantasia_apelido || item.cpf_cnpj })) };
    },
  };
}
