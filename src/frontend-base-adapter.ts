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
      const params = { ativo: true, papel: roleByKind[kind] };
      if (!search) {
        const response = await http.get<Page<BasePerson>>('/pessoas', { security: 'bearer', params: { ...params, page, page_size: pageSize } });
        return { ...response.data, items: response.data.items.map((item) => ({ uuid: item.uuid, nome: item.nome, descricao: item.nome_fantasia_apelido || item.cpf_cnpj })) };
      }
      // O backend-base pagina pessoas por papel, mas ainda não oferece busca textual nesse endpoint.
      // O adaptador percorre as páginas autorizadas e aplica a busca sem expor essa limitação ao módulo.
      const first = (await http.get<Page<BasePerson>>('/pessoas', { security: 'bearer', params: { ...params, page: 1, page_size: 100 } })).data;
      const pageCount = Math.ceil(first.total / first.page_size);
      const remaining = await Promise.all(Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => http.get<Page<BasePerson>>('/pessoas', { security: 'bearer', params: { ...params, page: index + 2, page_size: 100 } })));
      const term = search.toLocaleLowerCase('pt-BR');
      const matches = [first.items, ...remaining.map((response) => response.data.items)].flat().filter((item) => [item.nome, item.nome_fantasia_apelido, item.cpf_cnpj].some((value) => value?.toLocaleLowerCase('pt-BR').includes(term)));
      const start = (page - 1) * pageSize;
      return { items: matches.slice(start, start + pageSize).map((item) => ({ uuid: item.uuid, nome: item.nome, descricao: item.nome_fantasia_apelido || item.cpf_cnpj })), total: matches.length, page, page_size: pageSize };
    },
  };
}
