# Kanban do Projeto

Este documento acompanha o estado atual do SaborExpress por módulos. A marcação segue o formato:

- [x] Concluído
- [ ] Pendente

## M00 - Base, Arquitetura e Monorepo

### Backend e Monorepo

- [x] Estrutura de monorepo com `backend/`, `frontend/`, `docs/` e `docker-compose.yml`.
- [x] Backend Laravel com Sanctum, PostgreSQL, Eloquent, Actions, Repositories, Resources, Form Requests e Enums.
- [x] Frontend React com Vite, TypeScript, Tailwind CSS, Axios e React Router.
- [x] Guia local `.ignore/module-guidelines-laravel.md` ignorado pelo Git.
- [x] Documentação principal no `README.md`.
- [x] Definir estratégia de deploy.
- [x] Criar configuração de produção.
- [x] Criar pipeline de CI/CD.
- [x] `composer.json` renomeado para `saborexpress/backend`.
- [x] `backend/README.md` e `frontend/README.md` com conteúdo próprio.
- [x] Token Sanctum com expiração configurada (43200 min / 12h).
- [x] Rate limiting: login `throttle:5,1`, register `throttle:3,1`.

## M01 - Autenticação, RBAC e Usuários

### Backend

- [x] Login com Laravel Sanctum.
- [x] Logout.
- [x] Consulta do usuário autenticado.
- [x] Middleware `role`.
- [x] Bloqueio de usuário inativo.
- [x] Payload global de erros para validação, autenticação, autorização, conflito, 404, 405 e erro interno.
- [x] CRUD administrativo de usuários.
- [x] Troca administrativa de senha.
- [x] Ativação e desativação de usuários.
- [x] Filtros de usuários por papel, status ativo e busca textual.
- [x] `UserResource` sem vazamento de senha ou token.
- [x] Avaliar uso de Policies quando houver regras por recurso.
- [x] `AuthController::register()` passou a usar Repository e senha `min:8` + `confirmed`.

### Frontend

- [x] Tela de login.
- [x] Tela de cadastro de cliente.
- [x] Controle básico de sessão com token.
- [x] Rotas protegidas por perfil.
- [x] Tela administrativa completa de usuários (gestão de equipe com criação, bloqueio/ativação, alteração de senha e exclusão).
- [x] Revisar permissão da rota de entregas para incluir o perfil `delivery`.

## M02 - Cardápio, Categorias e Produtos

### Backend

- [x] CRUD de categorias.
- [x] CRUD de produtos.
- [x] Cardápio público para leitura.
- [x] Escrita restrita ao perfil `administrator`.
- [x] Busca textual de produtos.
- [x] Filtros por categoria, disponibilidade, faixa de preço e estoque.
- [x] Atualização dedicada de disponibilidade.
- [x] Estoque simples opcional por `stock_quantity`.
- [x] Ajuste automático de estoque ao adicionar, alterar, remover ou cancelar item de comanda.
- [x] Seeders de categorias e produtos.
- [x] Definir se haverá estoque avançado com movimentações históricas.

### Frontend

- [x] Tela pública de cardápio (inclui cache SWR para carregamento instantâneo, skeleton loaders premium e imagens de alta definição via Unsplash para todos os itens).
- [x] Tela administrativa de categorias.
- [x] Tela administrativa de produtos.
- [x] Interface para disponibilidade e estoque (integração inline com toggle de vendas e controle de estoque de ingredientes).
- [x] Topbar com design premium, barra de pesquisa integrada e mecanismo robusto de busca (filtro instantâneo no cardápio público por nome e descrição com chips informativos de busca e estados vazios humanizados).

## M03 - Mesas e Salão

### Backend

- [x] CRUD de mesas.
- [x] Abertura transacional de mesa com criação de comanda.
- [x] Prevenção de comanda ativa duplicada.
- [x] Consulta de comanda ativa por mesa.
- [x] Reserva com nome, telefone e horário reservado.
- [x] Cancelamento de reserva com limpeza dos dados de reserva.
- [x] Liberação para limpeza após pagamento ou cancelamento.
- [x] Conclusão de limpeza, retornando a mesa para `Livre`.
- [x] Transferência de comanda entre mesas.
- [x] Junção de comandas entre mesas abertas.
- [x] Status de mesa: `Livre`, `Ocupada`, `Reservada`, `Fechamento`, `Limpeza`.
- [x] Múltiplas reservas com histórico via tabela `table_reservations` (backend robusto).
- [x] Definir histórico detalhado de movimentações de mesa, caso o escopo exija auditoria operacional específica.

### Frontend

- [x] Tela de mesas.
- [x] Tela de detalhes da comanda por mesa.
- [x] Abertura de mesa integrada à API.
- [x] Transferência e junção de comandas integradas à API.
- [x] Tela administrativa de cadastro e manutenção de mesas.
- [x] Portal Público do Cliente para criação e acompanhamento de reservas online (`/minhas-reservas`).
- [x] Melhorar fluxo visual de reserva e limpeza (inclui suporte visual a mesas em Limpeza e Reservadas com ações de liberação, cancelamento e ocupação imediata).

## M04 - Auditoria e Histórico

### Backend

- [x] Migration `audit_events`.
- [x] Model `AuditEvent`.
- [x] Enum `AuditEventType`.
- [x] Repository de auditoria.
- [x] Action `RecordAuditEventAction`.
- [x] Resource `AuditEventResource`.
- [x] Controller `AuditEventController`.
- [x] Rotas administrativas `GET /api/audit-events` e `GET /api/audit-events/{auditEvent}`.
- [x] Filtros por evento, usuário, recurso auditado, período e paginação.
- [x] Registro automático de eventos nos fluxos de usuários, categorias, produtos, mesas, comandas, itens, cozinha e pagamentos.
- [x] Definir política de retenção ou expurgo de histórico.

### Frontend

- [x] Tela administrativa de auditoria.
- [x] Filtros visuais para evento, usuário, recurso e período.

## M05 - Comandas e Itens

### Backend

- [x] Listagem de comandas.
- [x] Consulta de comanda.
- [x] Inclusão de item.
- [x] Alteração de item.
- [x] Remoção de item.
- [x] Entrega de item.
- [x] Cancelamento de item.
- [x] Snapshot de preço em `order_items.unit_price`.
- [x] Recálculo automático do total.
- [x] Itens cancelados não entram no total.
- [x] Bloqueio de fechamento enquanto houver item `Pendente`, `Em Preparo` ou `Pronto`.
- [x] Transição oficial da comanda: `Aberta -> Fechamento -> Paga` ou `Cancelada`.

### Frontend

- [x] Modal de carrinho da comanda.
- [x] Inclusão de itens na comanda.
- [x] Solicitação de fechamento da comanda.
- [x] Conectar edição de quantidade e observações ao fluxo completo (comanda permite editar observações e quantidade de itens pendentes na API).
- [x] Conectar remoção e cancelamento de item à interface (garçom consegue excluir itens pendentes ou cancelar itens em preparo diretamente da tela).
- [x] Exibir estados da cozinha com maior clareza na comanda (badges dinâmicas e animadas para Pendente, Em Preparo, Pronto, Entregue e Cancelado).

## M06 - Cozinha

### Backend

- [x] Fila por item para `Pendente`, `Em Preparo` e `Pronto`.
- [x] Filtros por status, comanda e paginação.
- [x] Fila agrupada por comanda em `GET /api/kitchen/orders`.
- [x] Início de preparo.
- [x] Marcação de item como pronto.
- [x] Entrega de item pronto ao salão pela rota `/api/kitchen/order-items/{orderItem}/deliver`.
- [x] Cancelamento de item antes da entrega.
- [x] Evento Laravel `OrderItemMarkedReady` ao marcar item como pronto.
- [x] Listener real para notificação em tempo real, caso o projeto use WebSocket ou broadcast (Laravel Reverb e Echo).

### Frontend

- [x] Painel da cozinha conectado às rotas reais.
- [x] Colunas de pendentes, em preparo e prontos.
- [x] Atualização automática por polling.
- [x] Notificação em tempo real (conectado via Laravel Echo).
- [x] Melhorar tratamento visual de erro nas ações da cozinha.

## M07 - Pagamentos e Caixa

### Backend

- [x] Registro de pagamento integral.
- [x] Pagamento simplificado ou parcial pela rota `/api/orders/{order}/pay`.
- [x] Simulação de divisão de conta integral, igual ou por itens.
- [x] Extração de `SimulatePaymentSplitAction` e `RefundPaymentAction` para Actions dedicadas.
- [x] Extração de `RegisterOrderPaymentAction` para fluxo unificado de pagamento.
- [x] Listagem e consulta de pagamentos.
- [x] Comanda muda para `Paga` após pagamento integral.
- [x] Mesa pode ser liberada para limpeza após pagamento.
- [x] Histórico de movimentações de caixa contínuo.
- [x] Sangria (com validação de limite).
- [x] Suprimento.
- [x] Estorno de pagamento com registro de auditoria e ajuste de saldo.
- [x] Relatórios financeiros fechados (endpoint GET /api/cash/report).

### Frontend

- [x] Tela de caixa.
- [x] Listagem de comandas em fechamento.
- [x] Ação de pagamento simplificado.
- [x] Histórico de Gaveta com Saldo em tempo real.
- [x] Modais de Sangria e Suprimento.
- [x] Funcionalidade visual de estorno de transações do dia.
- [x] Fluxo visual completo de pagamentos parciais (Custom Amount / Valor Avulso).
- [x] Interface de divisão de conta por pessoas ou itens.

## M08 - Delivery e Retirada

### Backend

- [x] Enum `OrderType` com `Delivery` e `Takeout`.
- [x] Campos básicos em `orders` para pedido sem mesa.
- [x] Endpoint seguro `POST /api/orders/delivery` sob middleware de cliente.
- [x] Endpoint `PUT /api/orders/{order}/delivery-status`.
- [x] Associação obrigatória de `user_id` com o perfil do cliente logado.
- [x] Reuso da action de itens para estoque e total no delivery.
- [x] Endpoints próprios para retirada (`orders/takeout`) protegidos.
- [x] Processamento atômico de pagamentos online na criação de pedidos de delivery e retirada.
- [x] Endereço estruturado (rua, número, bairro, CEP, referência na migration e banco).
- [x] Atribuição de entregador (auto-assumir entrega na API e painel).
- [x] Acompanhamento pelo cliente (endpoint `orders/{order}/track` sob `auth:sanctum`).
- [x] Extração de `CreateDeliveryOrderAction` e `CreateTakeoutOrderAction` para Actions dedicadas.

### Frontend

- [x] Tela pública de pedido delivery (exige login de cliente com preenchimento automático).
- [x] Seleção reativa de pagamentos (no ato da entrega vs pelo site) com simulação realista de cartão de crédito e Pix online.
- [x] Aba "Meus Pedidos" exclusiva para o cliente consultar histórico e rastreamento em andamento de forma nativa.
- [x] Painel de entregas.
- [x] Corrigir acesso do perfil `delivery` ao painel de entregas (RBAC configurado no frontend e backend).
- [x] Tela de acompanhamento pelo cliente (OrderTracking timeline em tempo real).
- [x] Tela ou fluxo de retirada (Timeline com destaque de retirada no balcão).

## M09 - Dashboard e Relatórios Operacionais

### Backend

- [x] Endpoint `GET /api/dashboard`.
- [x] Indicadores básicos de comandas.
- [x] Contagem por status compatível com os enums atuais.
- [x] Curva ABC baseada em pedidos pagos.
- [x] Relatórios financeiros avançados (daily curves, channels, payment methods, operators).
- [x] Indicadores por período, operador, forma de pagamento e canal.
- [x] Extração do `DashboardController` para usar `DashboardRepositoryInterface` (~195 linhas → 27 linhas).

### Frontend

- [x] Tela de dashboard administrativo.
- [x] Ajustar visualização para métricas reais do MVP (AreaChart, BarChart e KPIs).
- [x] Criar filtros por período (Filtros de hoje, 7 dias, 30 dias e todo o período).

## M10 - Documentação e OpenAPI

### Documentação

- [x] `README.md` com visão geral do projeto.
- [x] `docs/API.md` atualizado com as rotas atuais.
- [x] `docs/kanban.md` organizado por módulos.
- [x] Scalar disponível em `/docs/api`.
- [x] OpenAPI em `backend/public/openapi.yaml` com schemas e endpoints de autenticação, cardápio, mesas, comandas, cozinha, pagamentos, delivery, dashboard e auditoria.
- [x] Documentar exemplos completos de fluxo ponta a ponta.
- [x] Documentar credenciais dos usuários seedados.
- [x] Documentar decisões arquiteturais relevantes.
- [x] Sincronizar `docs/API.md` com rotas reais (corrigido público → autenticado para delivery/takeout/track).
- [x] Sincronizar `walkthrough SaborExpress.md` com versão real do Laravel (11 → 12), CORS e RBAC do register.

## M11 - Docker e Ambiente Local

### Infraestrutura

- [x] `docker-compose.yml` com `postgres`, `backend` e `frontend`.
- [x] Possibilidade de subir a stack completa via `docker compose up -d --build`.
- [x] Possibilidade de subir apenas o banco via `docker compose up -d postgres`.
- [x] Porta do PostgreSQL configurável por `POSTGRES_PORT`.
- [x] `backend/Dockerfile` com PHP 8.3, Apache, Composer e extensão PostgreSQL.
- [x] Entrypoint do backend aguardando banco, executando migrations e seeders.
- [x] `frontend/Dockerfile` com Node 22 e Vite.
- [x] `.dockerignore` para backend e frontend.
- [x] Scripts Docker no `package.json`.
- [x] Avaliar imagem de produção separada para frontend estático.
- [x] Avaliar uso de variáveis reais de ambiente para produção.

## M12 - Qualidade Técnica

### Backend

- [x] Padronização global de erros.
- [x] Auditoria operacional com histórico consultável.
- [x] Uso de transações nos fluxos críticos.
- [x] Uso de `lockForUpdate()` em operações sensíveis.
- [x] Validações manuais com lint PHP, listagem de rotas, migrations e seeders.
- [x] Criar testes automatizados.
- [x] Criar factories específicas para os módulos principais.
- [x] Criar testes de integração para o fluxo presencial completo.
- [x] Criar testes de integração para delivery.
- [x] Criar testes de integração para pagamentos.
- [x] Criar testes de integração para dashboard (acesso admin e não-admin).
- [x] Criar testes de integração para reservas de cliente.
- [x] Criar testes de integração para split de pagamento (integral, igual, por itens, refund duplicado).

### Frontend

- [x] Lint configurado.
- [x] Cliente HTTP centralizado (`lib/api.ts` integrado em 100% das páginas e modais do frontend).
- [x] `.env.example` com `VITE_API_URL`.
- [x] `Navigation` extraído do `App.tsx` para componente dedicado.
- [x] `echo.ts` exporta instância em vez de poluir `window`.
- [x] Padronizar componentes visuais.
- [x] Melhorar tratamento global de erros no cliente.
- [x] Revisar responsividade das telas operacionais (landing page, login, mesas, comandas, cozinha, caixa e delivery otimizados para mobile, tablet e desktop).
- [x] Corrigir `hover:scale-[1.02]` (substituir `hover:scale-102` em todo o frontend).
- [x] Normalizar `Cartao`/`Cartão`: controllers usam `Cartao`, validações normalizam `Cartão` → `Cartao`.

## M13 - Refatoração de Arquitetura (Padrão Repository/Action)

### Backend

- [x] `DashboardController` extraído de 195 linhas inline para 27 linhas com `DashboardRepositoryInterface`.
- [x] `EloquentDashboardRepository` implementa consultas de KPIs, curva ABC, revenue chart e rankings.
- [x] `CreateDeliveryOrderAction` — lógica de criação de pedido delivery extraída do controller.
- [x] `CreateTakeoutOrderAction` — lógica de criação de pedido retirada extraída do controller.
- [x] `SimulatePaymentSplitAction` — lógica de split (integral, igual, por itens) extraída do controller.
- [x] `RefundPaymentAction` — lógica de estono extraída do controller.
- [x] `RegisterOrderPaymentAction` — fluxo unificado de pagamento (cria Payment + CashMovement + libera mesa).
- [x] `StoreDeliveryOrderRequest`, `StoreTakeoutOrderRequest` — Form Requests para substituir validação inline.
- [x] `SimulateSplitRequest`, `PayRequest` — Form Requests para validação de pagamentos.
- [x] `CashMovementController` migrado para `CashMovementRepositoryInterface` + `CreateCashMovementAction`.
- [x] `TableReservationController` migrado para `TableReservationRepositoryInterface` + Actions.
- [x] `OrderController::myOrders()` usa `$this->orders->paginateForUser()`.
- [x] CORS `supports_credentials` corrigido para `true`.
- [x] Rota `/orders/{order}/track` movida para dentro de `auth:sanctum`.

## M14 - Identidade Visual e Branding

### Frontend

- [x] Metatags completas: `lang=pt`, description, Open Graph, Twitter Card, theme-color, `favicon.svg`.
- [x] Paleta de cores expandida: `sabor-50` a `sabor-950`, `accent-express-*` (âmbar), `surf-*` (ciano).
- [x] Background temático global: geometric grid verde sutil no `body`.
- [x] Scrollbar customizada nas cores da marca.
- [x] `::selection` com cor verde da marca.
- [x] `scroll-behavior: smooth` no HTML.
- [x] SplashScreen com logo animada, slogans rotativos amazônicos e loading bar.
- [x] Classe utilitária `bg-sabor-grid` para uso pontual.

## Próximas Prioridades

1. **Error Boundary no Frontend**: Adicionar React Error Boundary no `App.tsx` para evitar tela branca em caso de crash.
2. **Validação Client-side de Senha**: Adicionar verificação de confirmação de senha no Register antes do submit.
3. **Remover `alert()` do `OrderCartModal`**: Substituir chamada de `alert()` por `toast.error()` do sonner.
4. **Cobertura de Testes**: Expandir testes unitários para Actions e Repositories; adicionar testes de autorização e validação.
5. **Relatórios Financeiros**: Implementar exportação de relatórios (CSV/PDF) para o dashboard e caixa.
6. **Componentes Reutilizáveis**: Criar componentes `EmptyState` e `LoadingSpinner` padronizados.
7. **Acess Mobile do Caixa**: Revisar layout responsivo da tela de caixa (sidebar + conteúdo).
8. **Cache Local SWR**: Expandir padrão SWR para demais páginas (cardápio digital, cozinha, entregas).

