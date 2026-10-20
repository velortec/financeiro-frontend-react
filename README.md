# @velortec/financeiro-react

Biblioteca React/TypeScript reutilizável para o backend `financeiro`. Ela fornece rotas, navegação, páginas, hooks, serviços, contratos TypeScript e estilos temáticos. Não cria aplicação, `BrowserRouter`, autenticação, refresh de token ou `QueryClient` próprios.

## Arquitetura e dependências

React, React DOM, React Router e TanStack Query são `peerDependencies`: a aplicação consumidora fornece uma única instância de cada uma. O módulo também recebe o cliente HTTP autenticado do frontend-base. Todas as requisições declaram `security: 'bearer'` e usam URLs iniciadas em `/financeiro`; o cliente-base, cuja `baseURL` já contém `/api/v1`, produz o prefixo final `/api/v1/financeiro`.

Os estilos usam os tokens CSS do consumidor (`--font-body`, `--font-heading`, `--color-primary`, `--color-surface`, `--color-border`, `--color-text`, `--color-muted`, `--color-danger`, `--color-warning`, `--color-success` e `--radius-md`) e apenas possuem fallbacks. Não há layout global concorrente.

## Instalação e atualização

```bash
npm install @velortec/financeiro-react@0.1.0
```

Atualize informando explicitamente a versão desejada. O pacote deve ser publicado pelo repositório `velortec/financeiro-frontend-react`; durante desenvolvimento também pode ser instalado por tarball (`npm pack`) ou dependência Git versionada.

## Contrato público

As principais exportações são:

- `FinanceiroProvider` e `useFinanceiro`;
- `financeiroRoutes`, `financeiroNavigation` e `getFinanceiroNavigation`;
- `financePermissions` e `registrationPermission`;
- `createFinanceService`, `useFinanceList`, `useFinanceDetail`, `useFinanceMutation` e `financeKeys`;
- páginas e componentes financeiros;
- tipos dos contratos HTTP e `FinanceHttpClient`.

O consumidor deve importar o CSS uma vez:

```ts
import '@velortec/financeiro-react/styles.css';
```

## Composição

O cliente do frontend-base é estruturalmente compatível com `FinanceHttpClient`.

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { useRoutes } from 'react-router-dom';
import { FinanceiroProvider, financeiroRoutes } from '@velortec/financeiro-react';
import { apiClient } from './infra/http/http-client';

function FinanceiroRoutes() {
  return useRoutes(financeiroRoutes);
}

// Dentro do Router, AuthProvider e QueryClientProvider já existentes:
<FinanceiroProvider http={apiClient} permissions={accessContext.permissoes}>
  <FinanceiroRoutes />
</FinanceiroProvider>
```

O pacote também oferece a composição pronta para uma rota curinga do Router existente:

```tsx
<Route path="financeiro/*" element={
  <FinanceiroModule
    http={apiClient}
    permissions={accessContext.permissoes}
    references={references}
  />
} />
```

`FinanceiroModule` não cria Router nem QueryClient. O artefato compilável [integration/frontend-base-composition.tsx](integration/frontend-base-composition.tsx) demonstra a composição com `useAuth` e `apiClient` reais do frontend-base.

Na árvore principal de rotas, monte o componente acima em `financeiro/*`. Nenhum router adicional deve ser criado.

Para integrar à sidebar/topbar:

```tsx
const items = getFinanceiroNavigation(accessContext.permissoes);
items.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>);
```

Alternativamente, `FinanceiroNavigation` renderiza o bloco filtrado pronto para inserção no `nav` do `AuthenticatedLayout`.

## Referências externas

O consumidor fornece um `ExternalReferenceAdapter`; o módulo fornece toda a interface de busca, carregamento, erro, vazio, paginação e seleção. Para o frontend-base:

```ts
const references = createFrontendBaseReferenceAdapter(apiClient, {
  supplierRole: 'FORNECEDOR',
  customerRole: 'CLIENTE',
  sellerRole: 'VENDEDOR',
});
```

Pessoas são consultadas por papel e Unidades Operacionais pelo endpoint público de referências. Como a versão atual do backend-base não possui busca textual em `GET /pessoas`, o adaptador percorre apenas as páginas autorizadas do papel solicitado e pagina localmente o resultado filtrado. UUIDs selecionados são enviados nos payloads financeiros.

A ausência de permissão remove o destino de navegação e cada página possui um `Guard` adicional que bloqueia acesso direto.

## Funcionalidades implementadas

- Visão geral com período, indicadores e obrigações prioritárias.
- Contas a pagar/receber: filtros, paginação, criação, detalhe, edição, cancelamento, indicadores e ações autorizadas retornadas pelo backend.
- Pagamentos, recebimentos e baixas: registro, histórico paginado, edição e cancelamento. Recebimentos usam `Idempotency-Key` e conflitos invalidam as consultas para recuperar o estado atual.
- Parcelamentos a pagar/receber: filtros, criação automática ou personalizada, validação da soma das parcelas, detalhe, navegação para parcelas, edição e cancelamento.
- Transferências: listagem, filtros, criação com referências cadastradas, detalhe e cancelamento.
- Fluxo de caixa com filtros, indicadores, movimentações e saldo entregue pelo selector.
- DRE hierárquica por período, detalhamento paginado e comparação de seis meses com consultas paralelas, sem recalcular os valores dos selectors.
- Tipos de Centro de Custo, Centros de Custo, Plano de Contas, Instituições Financeiras, Contas Financeiras e Formas de Pagamento: consulta, criação, edição, ativação e desativação segundo permissões.
- Estilos responsivos baseados em tokens do frontend-base.

Tipos de Centro de Custo são recursos reais do backend; Centro de Custo recebe `tipo_centro_custo_uuid`. Não há enum agrícola, `campo_uuid`, saldo materializado de conta financeira, Pedido de Venda, Produção Agrícola, Estoque ou entidade específica da Portas Decor.

## Limites de integração conhecidos

- Fornecedor, cliente, vendedor e unidade operacional pertencem ao consumidor. Eles são selecionados pelo contrato `ExternalReferenceAdapter`; nenhum cadastro externo é duplicado no pacote.
- O contrato backend não oferece endpoints separados de integração com Pedido de Venda; esses fluxos permanecem responsabilidade do consumidor.
- A comparação mensal usa uma consulta DRE por mês, executada em paralelo e armazenada pelo cache do TanStack Query. Não foi criado endpoint agregado fictício.

Esses pontos são explicitados para não apresentar placeholders como funcionalidade concluída.
