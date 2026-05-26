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

Exigem `administrator`, `waiter` ou `cashier`. As rotas `GET /orders` e `GET /orders/{order}` também são acessíveis ao perfil `delivery`.

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
- `POST /payments/{payment}/refund`
- `GET /cash/movements`
- `POST /cash/movements`
- `GET /cash/report`

`/orders/{order}/payments` registra pagamento integral validado. `/orders/{order}/split` simula divisão integral, igual ou por itens. `/orders/{order}/pay` registra pagamentos simplificados, parciais ou personalizados usados pela tela de caixa.
`POST /payments/{payment}/refund` estorna um pagamento previamente realizado e reflete no saldo em caixa.
`GET /cash/movements` retorna todo o histórico de movimentações do dia e o saldo em caixa calculado.
`POST /cash/movements` registra movimentações manuais de `Sangria` ou `Suprimento`.
`GET /cash/report` retorna o relatório consolidado de fechamento de caixa do dia (somatório por Pix, Dinheiro, Cartão, Sangria, Suprimento e saldo em gaveta).

## Delivery e Retirada

- `POST /orders/delivery`
- `POST /orders/takeout`
- `GET /orders/{order}/track`
- `PUT /orders/{order}/delivery-status`
- `PATCH /orders/{order}/assign-driver`

`POST /orders/delivery` exige autenticação de cliente (`role:client`) e cria pedido sem mesa (salva CEP e endereço estruturado). `POST /orders/takeout` exige autenticação de cliente (`role:client`) para pedidos de retirada.
`GET /orders/{order}/track` exige autenticação e é usado para rastreamento online em tempo real (timeline do cliente logado).
`PUT /orders/{order}/delivery-status` atualiza o status entre `Aguardando`, `Em Rota` e `Entregue` (exige `delivery` ou `administrator`).
`PATCH /orders/{order}/assign-driver` permite que entregadores parceiros (ou administradores) aceitem e se auto-atribuam a uma entrega expressa (exige `delivery` ou `administrator`).

## Reservas Online de Cliente

Exigem papel `client`.

- `GET /client/reservations`
- `POST /client/reservations`
- `DELETE /client/reservations/{tableReservation}`
- `GET /client/tables`

O cliente autenticado pode listar as mesas disponíveis, criar uma nova reserva agendada em uma mesa, listar seu próprio histórico de reservas ou cancelar uma reserva.

## Dashboard

Exige papel `administrator`.

- `GET /dashboard`

Filtros opcionais: `period` (`today`, `7d`, `30d`, `all`), `operator_id`, `payment_method`, `channel`.
Retorna KPIs consolidados de faturamento, ticket médio, comandas pagas e ativas, curva ABC de produtos mais vendidos, gráfico de faturamento ao longo do tempo (`revenue_chart` agrupado por dia ou por hora), break-down de faturamento por canais (Mesa, Delivery, Takeout), break-down por meios de pagamento (Pix, Cartão, Dinheiro) e ranking de vendas de operadores de caixa.

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
- **Desacoplamento**: Todas as chamadas do frontend utilizam a instância `api` centralizada em vez de importações ad-hoc.

> [!NOTE]
> O arquivo [DeliveryClient.tsx](file:///c:/Users/ShinerayADM/Projetos/saborexpress/frontend/src/pages/DeliveryClient.tsx) é a única exceção que mantém a importação direta de `axios` exclusivamente para consultar a API pública e externa do ViaCEP (`https://viacep.com.br/ws/...`), preservando o cliente interno do SaborExpress de interferências de CORS ou cabeçalhos globais.
