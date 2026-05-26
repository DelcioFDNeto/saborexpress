# SaborExpress — Backend API

API REST construída com **Laravel 12** para o sistema de gestão de restaurantes SaborExpress.

## Arquitetura

O backend segue o padrão **Repository/Action** para desacoplamento:

- **Controllers** — Validação de entrada e orquestração
- **Repositories** (com Interface) — Acesso a dados via Eloquent
- **Actions** — Lógica de negócio isolada e testável
- **Form Requests** — Validação centralizada
- **Resources** — Serialização de respostas (JSON:API)
- **Enums** — Constantes tipadas (PHP 8.2+)

### Estrutura de Diretórios

```
app/
├── Actions/           # Lógica de negócio (Orders, Payments, Tables, Kitchen, Audit, CashMovements, TableReservations)
├── Enums/             # OrderStatus, PaymentStatus, PaymentMethod, UserRole, etc.
├── Http/
│   ├── Controllers/   # 14 controllers RESTful
│   ├── Requests/      # Form Requests para validação
│   └── Resources/     # API Resources para serialização
├── Models/            # 10 Eloquent Models
├── Providers/         # Bindings de Repository → Eloquent
└── Repositories/      # 10 Repositories com interfaces
```

## Configuração Local

```bash
# Instalar dependências
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Criar banco e popular dados
php artisan migrate --seed

# Iniciar servidor
php artisan serve
```

## Testes

```bash
# Executar suíte completa
php artisan test

# Com cobertura
php artisan test --coverage
```

## Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| **Autenticação** | Login/Registro via Sanctum com tokens, rate limiting |
| **Cardápio** | CRUD de categorias e produtos com imagens |
| **Mesas** | Abertura, transferência, merge de comandas |
| **Pedidos** | Ciclo completo: abrir → itens → cozinha → entrega → pagamento |
| **Cozinha (KDS)** | Fila de preparo com WebSocket (Reverb) em tempo real |
| **Pagamentos** | Pagamento integral e split (por pessoa/por item) |
| **Caixa** | Movimentações financeiras, suprimento, sangria, relatórios |
| **Delivery** | Pedidos de entrega com rastreamento de status |
| **Reservas** | Reserva de mesas com verificação de conflitos |
| **Auditoria** | Log completo de eventos do sistema |
| **Dashboard** | KPIs, curva ABC, faturamento por período/método/canal |

## Variáveis de Ambiente Importantes

| Variável | Descrição | Default |
|----------|-----------|---------|
| `FRONTEND_URL` | URL do frontend para CORS | `http://localhost:5173` |
| `SANCTUM_TOKEN_EXPIRATION` | Expiração de tokens (minutos) | `43200` (30 dias) |
| `REVERB_APP_KEY` | Chave do WebSocket Reverb | — |
