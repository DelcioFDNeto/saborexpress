# Kanban do Projeto

Este documento acompanha o estado atual do SaborExpress por módulos.

## M00 - Base, Arquitetura e Monorepo

### Concluído

- Monorepo com `backend/`, `frontend/`, `docs/` e Docker Compose.
- Backend Laravel com Sanctum, PostgreSQL, Eloquent, Actions, Repositories, Resources, Form Requests e Enums.
- Frontend React com Vite, TypeScript e Tailwind CSS.
- Guia local `.ignore/module-guidelines-laravel.md` ignorado pelo Git.
- Documentação principal no `README.md`.

### Pendente

- Definir estratégia de deploy.
- Criar configuração de produção.
- Criar pipeline de CI/CD.

## M01 - Autenticação, RBAC e Usuários

### Concluído

- Login, logout, usuário atual e token Sanctum.
- Middleware `role` com bloqueio de usuário inativo.
- Payload global de erros para validação, autenticação, autorização, conflito, 404, 405 e erro interno.
- CRUD administrativo de usuários.
- Troca administrativa de senha.
- Ativação e desativação de usuários.
- Filtros de usuários por papel, status ativo e busca textual.
- `UserResource` sem vazamento de senha ou token.

### Pendente

- Avaliar Policies quando houver regras por recurso.
- Criar tela administrativa de usuários no frontend.

## M02 - Cardápio, Categorias e Produtos

### Concluído

- CRUD backend de categorias e produtos.
- Cardápio público para leitura.
- Escrita restrita ao perfil `administrator`.
- Busca textual de produtos.
- Filtros por categoria, disponibilidade, faixa de preço e estoque.
- Atualização dedicada de disponibilidade.
- Estoque simples opcional por `stock_quantity`.
- Ajuste automático de estoque ao adicionar, alterar, remover ou cancelar item de comanda.
- Seeders de categorias e produtos.

### Pendente

- Criar telas administrativas para categorias e produtos.
- Definir se haverá estoque avançado com movimentações históricas.

## M03 - Mesas e Salão

### Concluído

- CRUD backend de mesas.
- Abertura transacional de mesa com criação de comanda.
- Prevenção de comanda ativa duplicada.
- Consulta de comanda ativa por mesa.
- Reserva com nome, telefone e horário reservado.
- Cancelamento de reserva com limpeza dos dados de reserva.
- Liberação para limpeza após pagamento ou cancelamento.
- Conclusão de limpeza, retornando a mesa para `Livre`.
- Transferência de comanda entre mesas.
- Junção de comandas entre mesas abertas.
- Status de mesa: `Livre`, `Ocupada`, `Reservada`, `Fechamento`, `Limpeza`.

### Pendente

- Criar tela administrativa de mesas.
- Definir histórico de movimentações de mesa, se o escopo exigir auditoria operacional.
 
## M04 - Auditoria e Histórico

### Concluído

- Migration `audit_events`.
- Model `AuditEvent`.
- Enum `AuditEventType`.
- Repository de auditoria.
- Action `RecordAuditEventAction`.
- Resource `AuditEventResource`.
- Controller `AuditEventController`.
- Rotas administrativas `GET /api/audit-events` e `GET /api/audit-events/{auditEvent}`.
- Filtros por evento, usuário, recurso auditado, período e paginação.
- Registro automático de eventos nos fluxos de usuários, categorias, produtos, mesas, comandas, itens, cozinha e pagamentos.

### Pendente

- Criar tela administrativa de auditoria no frontend.
- Definir retenção de histórico, se o projeto precisar de política de expurgo.

## M05 - Comandas e Itens

### Concluído

- Listagem e consulta de comandas.
- Inclusão, alteração, remoção, entrega e cancelamento de itens.
- Snapshot de preço em `order_items.unit_price`.
- Recálculo automático do total.
- Itens cancelados não entram no total.
- Bloqueio de fechamento enquanto houver item `Pendente`, `Em Preparo` ou `Pronto`.
- Transição oficial da comanda: `Aberta -> Fechamento -> Paga` ou `Cancelada`.

### Pendente

- Conectar o frontend ao fluxo completo de comanda por mesa.

## M06 - Cozinha

### Concluído

- Fila por item para `Pendente`, `Em Preparo` e `Pronto`.
- Filtros por status, comanda e paginação.
- Fila agrupada por comanda em `GET /api/kitchen/orders`.
- Início de preparo.
- Marcação de item como pronto.
- Entrega de item pronto ao salão pela rota `/api/kitchen/order-items/{orderItem}/deliver`.
- Cancelamento de item antes da entrega.
- Evento Laravel `OrderItemMarkedReady` ao marcar item como pronto.
- Painel da cozinha no frontend conectado às rotas reais.

### Pendente

- Adicionar listener real para notificação em tempo real, caso o projeto use WebSocket ou broadcast.

## M07 - Pagamentos e Caixa

### Concluído

- Registro de pagamento integral.
- Pagamento simplificado ou parcial pela rota `/api/orders/{order}/pay`.
- Simulação de divisão de conta integral, igual ou por itens.
- Listagem e consulta de pagamentos.
- Comanda muda para `Paga` após pagamento integral.
- Mesa pode ser liberada para limpeza após pagamento.

### Pendente

- Abertura e fechamento de caixa.
- Sangria, suprimento, estorno e relatórios financeiros.

## M08 - Delivery e Retirada

### Concluído

- Enum `OrderType` já prevê `Delivery` e `Takeout`.
- A tabela `orders` já possui campos básicos para pedido sem mesa.
- Endpoint público `POST /api/orders/delivery`.
- Endpoint `PUT /api/orders/{order}/delivery-status`.
- Painel de entregas no frontend.
- Tela pública de pedido delivery no frontend.

### Pendente

- Endpoints próprios para retirada.
- Endereço estruturado.
- Atribuição de entregador.
- Acompanhamento pelo cliente.

## M09 - Documentação

### Concluído

- `README.md` com visão geral do projeto.
- `docs/API.md` atualizado com as rotas atuais.
- Scalar disponível em `/docs/api`.
- OpenAPI em `backend/public/openapi.yaml` com schemas e endpoints de autenticação, cardápio, mesas, comandas, cozinha, pagamentos, delivery, dashboard e auditoria.

### Pendente

- Documentar exemplos completos de fluxo ponta a ponta.

## M10 - Qualidade Técnica

### Concluído

- Padronização global de erros.
- Auditoria operacional com histórico consultável.
- Validações manuais com lint PHP, listagem de rotas, migrations e seeders.
- Uso de transações e `lockForUpdate()` nos fluxos críticos.

### Pendente

- Criar testes automatizados.
- Criar factories específicas para os módulos principais.
- Criar testes de integração para o fluxo presencial completo.

## Próximas Prioridades

1. Corrigir telas administrativas ausentes no frontend.
2. Implementar retirada.
3. Criar fluxo completo de caixa.
4. Documentar exemplos ponta a ponta.
5. Criar testes automatizados dos fluxos críticos.
