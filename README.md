# SaborExpress ERP 🍔

Bem-vindo ao **SaborExpress**, uma plataforma ERP de ponta a ponta construída como projeto acadêmico para gestão integral de restaurantes, abrangendo desde o autoatendimento e controle de mesas até a expedição na cozinha, logística de delivery e dashboard financeiro.

## 🚀 Arquitetura Tecnológica
O SaborExpress foi construído utilizando as mais modernas práticas de engenharia de software:

- **Backend (API RESTful):** Laravel 11.x (PHP 8.2+)
- **Frontend (SPA):** React 18 + TypeScript + Vite
- **Estilização:** TailwindCSS (Design System customizado e responsivo)
- **Banco de Dados:** PostgreSQL hospedado nativamente (Suporte a Neon Serverless)
- **Autenticação:** Laravel Sanctum (Stateful JWT via Bearer Token)
- **Controle de Acesso:** Sistema rigoroso de RBAC (Role-Based Access Control)

## 📦 Módulos do Sistema (Escopo 100% Concluído)

O projeto foi rigorosamente desenhado para atender aos 6 fluxos essenciais da gestão de restaurantes:

### M01: Cardápio Digital Público
Catálogo dinâmico, dividido por categorias (Entradas, Pratos Principais, Sobremesas, Bebidas) com interface limpa voltada à conversão.

### M02: Gestão de Mesas e Salão (Garçom)
Controle visual das mesas em tempo real. Permite abertura, lançamento de produtos, fechamento, transferência e agrupamento inteligente de mesas.

### M03: Kitchen Display System - KDS (Cozinheiro)
Painel de expedição automatizado. A cozinha recebe os pedidos vindos tanto das Mesas quanto do Delivery em tempo real, mudando o status para *Em Preparo* e *Pronto*, controlando o fluxo de gargalos através do tempo de espera.

### M04: Logística de Delivery (Motoqueiro)
Portal do cliente para inserção de pedidos no carrinho sem fricção de login. Os pedidos despachados caem no painel do Entregador, que assume a rota e confirma a entrega no smartphone.

### M05: Motor de Divisão de Contas (Caixa)
O "cérebro" financeiro do fechamento. Permite dividir a conta de três formas precisas:
- **Integral:** Um cliente paga tudo.
- **Divisão Igualitária:** O sistema calcula dízimas e divide por X pessoas na mesa.
- **Divisão Por Item:** Calculadora dinâmica onde o cliente escolhe pagar apenas os itens específicos (Ex: "Só a minha bebida e a minha pizza").

### M06: Painel Gerencial de BI (Administrador)
Dashboard executivo exibindo indicadores-chave em tempo real:
- Faturamento Bruto (Agregado em pagamentos reais).
- Ticket Médio e Volume de Contas.
- **Curva ABC Automatizada:** Ranqueamento cruzado matemático que lista quais produtos têm maior saída volumétrica e peso financeiro na receita.

## 🔐 Contas de Acesso (Cargos)
O sistema possui 5 níveis hierárquicos invioláveis, controlados por ContextAPI no frontend e Middleware no backend.

1. **administrator:** Acesso total (Inclui Painel Gerencial e Gerenciamento de Equipe).
2. **cashier:** Acesso ao módulo financeiro (Recebimentos).
3. **waiter:** Acesso restrito ao mapa de mesas e comandas.
4. **kitchen:** Acesso exclusivo ao balcão de expedição (KDS).
5. **delivery_driver:** Acesso ao rastreio de entregas e expedição na rua.
6. **client:** Acesso ao Cardápio e Delivery (Criado pelo cadastro público).

*Atenção: Apenas Administradores podem criar contas para a equipe (via Painel Gerencial).*

### 🔑 Credenciais de Teste (Seeders)
Para facilitar os testes, o banco de dados já nasce com as seguintes contas pré-configuradas (A senha padrão para todas é **`password`**):
- **Admin:** `admin@saborexpress.com`
- **Garçom:** `waiter@saborexpress.com`
- **Cozinha:** `kitchen@saborexpress.com`
- **Caixa:** `cashier@saborexpress.com`
- **Entregador:** `delivery@saborexpress.com`
- **Cliente:** `client@saborexpress.com`

## ⚙️ Como Testar Localmente (Desenvolvimento)

### 1. Iniciar o Banco e Backend
```bash
cd backend
cp .env.example .env
# Configure sua string de conexão Neon ou Postgres local no .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
# O Laravel rodará em http://127.0.0.1:8000
```

### 2. Iniciar o Frontend
```bash
cd frontend
npm install
npm run dev
# O React rodará em http://localhost:5173
```

---
*Projeto acadêmico desenvolvido com foco em Clean Code, escalabilidade de microsserviços monolíticos e UX premium.*
