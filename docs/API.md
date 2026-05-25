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
- `GET /tables/{table}/active-order`
- `POST /orders/{order}/items`

Body de `PATCH|PUT /orders/{order}`:

```json
{
  "status": "Fechamento"
}
```

Body de `POST /orders/{order}/items`:

```json
{
  "product_id": 1,
  "quantity": 2,
  "notes": "Sem cebola"
}
```

Ao adicionar um item, o backend consulta o preco atual do produto e grava o snapshot em `order_items.unit_price`. O total da comanda e recalculado no backend.

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

## Codigo ainda nao implementado

- Cozinha, caixa, delivery e cliente ainda nao possuem endpoints dedicados.
- Ainda nao ha seeders de categorias e produtos.
- Alteracoes de enums em migrations existentes exigem recriar o banco local ou criar migrations de alteracao caso ja exista banco persistido.
