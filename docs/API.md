# API atual

Esta pagina documenta apenas as rotas registradas hoje em `backend/routes/api.php`. Ela nao descreve o produto final planejado.

Base local esperada:

```text
http://localhost:8000/api
```

Também existe uma especificação OpenAPI em:

```text
backend/public/openapi.yaml
```

Com o backend em execução, a visualização interativa com Scalar fica disponível em:

```text
http://localhost:8000/docs/api
```

## Autenticacao

### `POST /login`

Faz login e retorna um token do Laravel Sanctum.

Body:

```json
{
  "email": "admin@saborexpress.com",
  "password": "password"
}
```

Resposta esperada:

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Administrator User",
    "email": "admin@saborexpress.com",
    "role": "administrator"
  }
}
```

## Rotas publicas

### Categorias

- `GET /categories`
- `GET /categories/{category}`

Observacao: a listagem usa paginacao e carrega produtos junto da categoria.

### Produtos

- `GET /products`
- `GET /products/{product}`

Filtros existentes na listagem:

- `category_id`
- `is_available`

Observacao: a listagem usa paginacao e retorna `ProductResource`.

## Rotas autenticadas

As rotas abaixo estao dentro do middleware `auth:sanctum` e exigem header:

```http
Authorization: Bearer <token>
Accept: application/json
```

### Usuario atual

- `GET /user`
- `GET /me`
- `POST /logout`

### Categorias protegidas

Exigem papel `administrator`.

- `POST /categories`
- `PUT/PATCH /categories/{category}`
- `DELETE /categories/{category}`

### Produtos protegidos

Exigem papel `administrator`.

- `POST /products`
- `PUT/PATCH /products/{product}`
- `DELETE /products/{product}`

### Mesas

Leitura e abertura exigem papel `administrator`, `waiter` ou `cashier`.

- `GET /tables`
- `GET /tables/{table}`
- `POST /tables/{table}/open`
- `POST /tables/{table}/release`

Body aceito por `open`:

```json
{
  "customer_name": "Joao Silva",
  "customer_phone": "(00) 00000-0000"
}
```

Criacao, atualizacao e exclusao exigem papel `administrator`.

- `POST /tables`
- `PUT/PATCH /tables/{table}`
- `DELETE /tables/{table}`

## M03 Comandas

### Comandas

As rotas abaixo exigem papel `administrator`, `waiter` ou `cashier`.

- `GET /orders`
- `GET /orders/{order}`
- `PATCH|PUT /orders/{order}`
- `POST /orders/{order}/request-closing`
- `POST /orders/{order}/cancel`
- `GET /tables/{table}/active-order`
- `POST /orders/{order}/items`

Body de `PATCH|PUT /orders/{order}`:

```json
{
  "status": "Fechamento"
}
```

Transição oficial da comanda:

- `Aberta`: aceita inclusão, alteração e remoção de itens.
- `Fechamento`: conta solicitada; itens não podem mais ser alterados.
- `Paga`: pagamento integral registrado.
- `Cancelada`: comanda encerrada sem pagamento.

Use `POST /orders/{order}/request-closing` para solicitar fechamento e `POST /orders/{order}/cancel` para cancelar. O status `Paga` deve ser alcançado pelo fluxo de pagamento.

Body de `POST /orders/{order}/items`:

```json
{
  "product_id": 1,
  "quantity": 2,
  "notes": "Sem cebola"
}
```

Ao adicionar um item, o backend consulta o preco atual do produto e grava o snapshot em `order_items.unit_price`. O total da comanda e recalculado no backend.

Itens só podem ser adicionados, alterados ou removidos enquanto a comanda estiver `Aberta`.

### Itens de comanda

As rotas abaixo exigem papel `administrator`, `waiter` ou `cashier`.

- `GET /order-items`
- `GET /order-items/{orderItem}`
- `PATCH /order-items/{orderItem}`
- `DELETE /order-items/{orderItem}`

Body de `PATCH /order-items/{orderItem}`:

```json
{
  "quantity": 3,
  "notes": "Sem cebola",
  "status": "Pendente"
}
```

Campos aceitos no update:

- `quantity`
- `notes`
- `status`

Status aceitos para item:

- `Pendente`
- `Em Preparo`
- `Pronto`
- `Entregue`

## Cozinha

As rotas abaixo exigem papel `administrator` ou `kitchen`.

- `GET /kitchen/order-items`
- `PATCH /kitchen/order-items/{orderItem}/start`
- `PATCH /kitchen/order-items/{orderItem}/mark-ready`

Filtros aceitos em `GET /kitchen/order-items`:

- `status`: `Pendente`, `Em Preparo` ou `Pronto`
- `order_id`
- `per_page`

Transições controladas pela cozinha:

- `PATCH /kitchen/order-items/{orderItem}/start`: muda de `Pendente` para `Em Preparo`.
- `PATCH /kitchen/order-items/{orderItem}/mark-ready`: muda de `Em Preparo` para `Pronto`.

A comanda precisa estar `Aberta` para receber atualizações da cozinha. O fechamento da comanda é bloqueado quando ainda existem itens `Pendente` ou `Em Preparo`.

## M04 Pagamentos e caixa inicial

### Pagamentos

As rotas abaixo exigem papel `administrator` ou `cashier`.

- `GET /payments`
- `GET /payments/{payment}`
- `POST /orders/{order}/payments`

Body de `POST /orders/{order}/payments`:

```json
{
  "method": "Pix",
  "amount": 84.5,
  "notes": "Pagamento integral"
}
```

Métodos aceitos:

- `Pix`
- `Cartao`
- `Dinheiro`

Regra atual: o pagamento é integral. A comanda precisa estar em `Fechamento` e o valor informado deve bater com `total_amount`. Ao registrar o pagamento, a comanda passa para `Paga`.

### Liberação de mesa

Depois que a comanda for paga ou cancelada, a mesa pode ser liberada:

- `POST /tables/{table}/release`

Essa operação falha se ainda houver comanda ativa para a mesa.

## Codigo ainda nao implementado

- Delivery e cliente ainda nao possuem endpoints dedicados.
- O painel visual da cozinha ainda nao foi implementado no frontend.
- Pagamento parcial, divisao de conta por valor e divisao por itens ainda nao foram implementados.
- Ainda nao ha seeders de categorias e produtos.
- Alteracoes de enums em migrations existentes exigem recriar o banco local ou criar migrations de alteracao caso ja exista banco persistido.
