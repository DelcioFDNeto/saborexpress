# API atual

Esta página documenta as rotas registradas no backend Laravel em `backend/routes/api.php`.

Base local esperada:

```text
http://localhost:8000/api
```

Com o backend em execução, a documentação interativa com Scalar fica disponível em:

```text
http://localhost:8000/docs/api
```

## Formato de erros

As respostas de erro da API seguem o formato:

```json
{
  "message": "Mensagem do erro.",
  "error": {
    "type": "validation_error",
    "status": 422
  },
  "errors": {
    "field": ["Mensagem de validação."]
  }
}
```

Os tipos principais são `validation_error`, `unauthenticated`, `forbidden`, `not_found`, `method_not_allowed`, `conflict`, `unprocessable_entity` e `internal_server_error`.

## Autenticação

- `POST /login`
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

Filtros de listagem:

- `role`
- `is_active`
- `search`
- `per_page`

## Categorias

Leitura pública:

- `GET /categories`
- `GET /categories/{category}`

Escrita exige `administrator`:

- `POST /categories`
- `PUT|PATCH /categories/{category}`
- `DELETE /categories/{category}`

## Produtos

Leitura pública:

- `GET /products`
- `GET /products/{product}`

Filtros de listagem:

- `search`
- `category_id`
- `is_available`
- `min_price`
- `max_price`
- `in_stock`
- `per_page`

Escrita exige `administrator`:

- `POST /products`
- `PUT|PATCH /products/{product}`
- `PATCH /products/{product}/availability`
- `DELETE /products/{product}`

Produtos possuem `stock_quantity` opcional. Quando o valor é `null`, o produto não tem controle de estoque. Quando é numérico, o backend bloqueia inclusão acima do estoque e ajusta estoque ao adicionar, alterar, remover ou cancelar item de comanda.

## Mesas

Leitura e operações de salão exigem `administrator`, `waiter` ou `cashier`.

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

Criação, atualização e exclusão exigem `administrator`.

- `POST /tables`
- `PUT|PATCH /tables/{table}`
- `DELETE /tables/{table}`

Status de mesa:

- `Livre`
- `Ocupada`
- `Reservada`
- `Fechamento`
- `Limpeza`

`release` coloca a mesa em `Limpeza` quando não há comanda ativa. `mark-free` conclui a limpeza e devolve a mesa para `Livre`.

`reserve` aceita `reservation_name`, `reservation_phone` e `reserved_at`. Esses campos são limpos ao cancelar a reserva ou abrir a mesa.

## Comandas

Exigem `administrator`, `waiter` ou `cashier`.

- `GET /orders`
- `GET /orders/{order}`
- `PUT|PATCH /orders/{order}`
- `POST /orders/{order}/request-closing`
- `POST /orders/{order}/cancel`
- `POST /orders/{order}/items`

Transição oficial:

- `Aberta`
- `Fechamento`
- `Paga`
- `Cancelada`

O fechamento é bloqueado enquanto houver itens `Pendente`, `Em Preparo` ou `Pronto`.

## Itens de Comanda

Exigem `administrator`, `waiter` ou `cashier`.

- `GET /order-items`
- `GET /order-items/{orderItem}`
- `PUT|PATCH /order-items/{orderItem}`
- `PATCH /order-items/{orderItem}/deliver`
- `PATCH /order-items/{orderItem}/cancel`
- `DELETE /order-items/{orderItem}`

Status de item:

- `Pendente`
- `Em Preparo`
- `Pronto`
- `Entregue`
- `Cancelado`

Itens cancelados não entram no total da comanda. A operação dedicada de cancelamento também devolve estoque quando o produto é controlado por estoque.

## Cozinha

Exigem `administrator` ou `kitchen`.

- `GET /kitchen/orders`
- `GET /kitchen/order-items`
- `PATCH /kitchen/order-items/{orderItem}/start`
- `PATCH /kitchen/order-items/{orderItem}/mark-ready`
- `PATCH /kitchen/order-items/{orderItem}/cancel`

`GET /kitchen/orders` agrupa a fila por comanda. `mark-ready` dispara o evento Laravel `OrderItemMarkedReady`, que pode ser usado depois para notificações em tempo real.

## Pagamentos

Exigem `administrator` ou `cashier`.

- `GET /payments`
- `GET /payments/{payment}`
- `POST /orders/{order}/payments`

Regra atual: pagamento integral. A comanda precisa estar em `Fechamento` e o valor informado deve bater com `total_amount`.

## Auditoria e Histórico

Exigem papel `administrator`.

- `GET /audit-events`
- `GET /audit-events/{auditEvent}`

Filtros de listagem:

- `event`
- `user_id`
- `auditable_type`
- `auditable_id`
- `date_from`
- `date_to`
- `per_page`

O backend registra eventos de auditoria para operações administrativas e operacionais, incluindo usuários, categorias, produtos, mesas, comandas, itens de comanda, cozinha e pagamentos. Cada evento guarda o usuário responsável, o tipo do evento, o recurso afetado e metadados úteis para reconstruir o histórico.

## Ainda pendente

- Delivery e retirada ainda não possuem endpoints próprios.
- Pagamento parcial, divisão de conta por valor e divisão por itens ainda não foram implementados.
- Relatórios e fluxo completo de caixa ainda não foram implementados.
- O frontend ainda não consome todas as novas rotas do backend.
