# SaborExpress — Frontend

Interface web construída com **React 18 + TypeScript + Vite** para o sistema de gestão de restaurantes SaborExpress.

## Stack

- **React 18** com TypeScript
- **Vite** para bundling e HMR
- **React Router v6** para navegação
- **Axios** via cliente centralizado (`lib/api.ts`)
- **Sonner** para notificações toast
- **Laravel Echo + Reverb** para WebSocket em tempo real
- **CSS customizado** com design system baseado em variáveis (`index.css`)

## Configuração Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura de Diretórios

```
src/
├── components/
│   ├── dashboard/     # Subcomponentes do painel (KPIs, Catalog, Tables, Staff, Clients, Audit)
│   ├── Navigation.tsx # Barra de navegação principal
│   ├── ProtectedRoute.tsx
│   └── OrderCartModal.tsx
├── contexts/
│   └── AuthContext.tsx # Autenticação via Sanctum
├── lib/
│   └── api.ts         # Cliente Axios centralizado com interceptors
├── pages/
│   ├── Index.tsx       # Landing page
│   ├── Menu.tsx        # Cardápio público com SWR cache + skeleton
│   ├── Login.tsx       # Login com glassmorphism
│   ├── Register.tsx    # Registro com confirmação de senha
│   ├── Dashboard.tsx   # Painel administrativo (6 abas)
│   ├── Kitchen.tsx     # KDS Kanban com WebSocket
│   ├── Cashier.tsx     # Caixa com split payment
│   ├── Tables.tsx      # Gestão de mesas
│   ├── OrderDetails.tsx
│   ├── DeliveryClient.tsx
│   ├── DeliveryPanel.tsx
│   └── ...
├── echo.ts            # Configuração do Laravel Echo/Reverb
└── App.tsx            # Rotas e layout principal
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API backend | `http://localhost:8000` |
| `VITE_REVERB_APP_KEY` | Chave do WebSocket Reverb | `saborexpresskey` |
| `VITE_REVERB_HOST` | Host do WebSocket | `localhost` |
| `VITE_REVERB_PORT` | Porta do WebSocket | `8080` |

## Padrões

- **SWR Cache**: Dados são cacheados em `localStorage` e exibidos instantaneamente com skeleton loaders enquanto a API atualiza em background
- **API centralizada**: Todas as chamadas à API usam `import { api } from '../lib/api'` — nunca axios direto
- **Tipagem forte**: Interfaces TypeScript para todos os modelos de dados, sem uso de `any`
- **Componentes modulares**: Dashboard dividido em 6 subcomponentes independentes
