# API Atual

Base local:

```text
http://localhost:8000/api
```

Documentação interativa com Scalar:

```text
http://localhost:8000/docs/api
```

## Autenticação

- `POST /login`
- `POST /register`
- `GET /user`
- `GET /me`
- `POST /logout`

O login retorna token Sanctum e usuário serializado. Usuários inativos não conseguem fazer login nem acessar rotas protegidas.

## Usuários

Exigem papel `administrator`.

- `GET /users`
- `POST /users`
- `GET /users/{user}`
- `PUT|PATCH /users/{user}`
- `DELETE /users/{user}`
- `PATCH /users/{user}/password`
- `PATCH /users/{user}/activate`
- `PATCH /users/{user}/deactivate`

Filtros: `role`, `is_active`, `search`, `per_page`.

## Cardápio

Leitura pública:

- `GET /categories`
- `GET /categories/{category}`
- `GET /products`
- `GET /products/{product}`

Escrita exige `administrator`:

- `POST /categories`
- `PUT|PATCH /categories/{category}`
- `DELETE /categories/{category}`
- `POST /products`
- `PUT|PATCH /products/{product}`
- `PATCH /products/{product}/availability`
- `DELETE /products/{product}`

Produtos aceitam filtros por busca, categoria, disponibilidade, faixa de preço, estoque e paginação.

## Mesas e Comandas

Exigem `administrator`, `waiter` ou `cashier`.

- `GET /tables`
- `GET /tables/{table}`
- `POST /tables/{table}/open`
- `PATCH /tables/{table}/reserve`
- `PATCH /tables/{table}/cancel-reservation`
- `POST /tables/{table}/release`
- `PATCH /tables/{table}/mark-free`
- `POST /tables/{table}/transfer-order`
- `POST /tables/{table}/merge-order`
- `GET /tables/{table}/active-order`
- `GET /orders`
- `GET /orders/{order}`
- `PUT|PATCH /orders/{order}`
- `POST /orders/{order}/request-closing`
- `POST /orders/{order}/cancel`
- `POST /orders/{order}/items`

Status oficiais da comanda: `Aberta`, `Fechamento`, `Paga`, `Cancelada`.

## Itens de Comanda

Exigem `administrator`, `waiter` ou `cashier`.

- `GET /order-items`
- `GET /order-items/{orderItem}`
- `PUT|PATCH /order-items/{orderItem}`
- `PATCH /order-items/{orderItem}/deliver`
- `PATCH /order-items/{orderItem}/cancel`
- `DELETE /order-items/{orderItem}`

Status oficiais do item: `Pendente`, `Em Preparo`, `Pronto`, `Entregue`, `Cancelado`.

## Cozinha

Exigem `administrator` ou `kitchen`.

- `GET /kitchen/orders`
- `GET /kitchen/order-items`
- `PATCH /kitchen/order-items/{orderItem}/start`
- `PATCH /kitchen/order-items/{orderItem}/mark-ready`
- `PATCH /kitchen/order-items/{orderItem}/deliver`
- `PATCH /kitchen/order-items/{orderItem}/cancel`

## Pagamentos e Caixa

Exigem `administrator` ou `cashier`.

- `GET /payments`
- `GET /payments/{payment}`
- `POST /orders/{order}/payments`
- `POST /orders/{order}/split`
- `POST /orders/{order}/pay`

`/orders/{order}/payments` registra pagamento integral validado. `/orders/{order}/split` simula divisão integral, igual ou por itens. `/orders/{order}/pay` registra pagamentos simplificados ou parciais usados pela tela de caixa.

## Delivery

- `POST /orders/delivery`
- `PUT /orders/{order}/delivery-status`

`POST /orders/delivery` é público e cria pedido sem mesa. `PUT /orders/{order}/delivery-status` atualiza o status entre `Aguardando`, `Em Rota` e `Entregue`.

## Dashboard

Exige papel `administrator`.

- `GET /dashboard`

Retorna faturamento, ticket médio, comandas pagas, comandas ativas e ranking de produtos vendidos.

## Auditoria e Histórico

Exigem papel `administrator`.

- `GET /audit-events`
- `GET /audit-events/{auditEvent}`

Filtros: `event`, `user_id`, `auditable_type`, `auditable_id`, `date_from`, `date_to`, `per_page`.

## Consumo da API no Frontend

Todo o frontend consome a API através de um cliente Axios centralizado localizado em [api.ts](file:///c:/Users/ShinerayADM/Projetos/saborexpress/frontend/src/lib/api.ts).

### Características do Cliente
- **Base URL automática**: Configurado com `import.meta.env.VITE_API_URL || 'http://localhost:8000'` e prefixo `/api` embutido.
- **Inserção automática do Token**: O token de autenticação (Sanctum) é inserido de forma automática e dinâmica nos headers de todas as requisições HTTP através da função `setAuthToken(token)`.
- **Desacoplamento**: Todas as chamadas para `/categories`, `/products`, `/orders`, `/tables` e `/kitchen` agora utilizam a instância `api` centralizada em vez de importações ad-hoc do Axios.

> [!NOTE]
> O arquivo [DeliveryClient.tsx](file:///c:/Users/ShinerayADM/Projetos/saborexpress/frontend/src/pages/DeliveryClient.tsx) é a única exceção que mantém a importação direta de `axios` exclusivamente para consultar a API pública e externa do ViaCEP (`https://viacep.com.br/ws/...`), preservando o cliente interno do SaborExpress de interferências de CORS ou cabeçalhos globais.

## Próximos Passos & Melhorias Pendentes

- **Controle de Caixa Avançado**: Telas e endpoints completos para abertura de caixa, fechamento diário, sangria (retirada de valores), suprimento (aporte de troco) e estorno operacional.
- **Fluxo de Retirada (Takeout)**: Adicionar suporte e endpoints dedicados a pedidos de retirada pelo próprio cliente no estabelecimento.
- **Telas Administrativas de Recursos**: Completar interfaces administrativas no frontend para o gerenciamento direto (CRUD) de usuários (com bloqueio/ativação), categorias, produtos e mesas.
- **Testes de Integração**: Implementar suítes de testes automatizados no backend e testes de ponta a ponta no frontend para cobertura de fluxos críticos (comanda, caixa e entregas).
- **WebSocket/Broadcast Real**: Habilitar notificações instantâneas no painel da cozinha (KDS) e garçons através de Websockets nativos utilizando o Echo integrado.
