# SaborExpress 🍕

> **Aviso Acadêmico:** Este é um projeto desenvolvido exclusivamente para fins acadêmicos, como parte da disciplina de **Arquitetura de Software**.

O **SaborExpress** é um sistema completo e moderno para a gestão de restaurantes, englobando desde o cardápio e controle de estoque até a gestão atômica do salão (mapa de mesas), comandas e integração com a cozinha. 

O projeto foi rigorosamente estruturado utilizando o padrão arquitetural **MVC Desacoplado**, garantindo a separação total de responsabilidades entre o Backend (API REST) e o Frontend (Client-side Rendering).

---

## 🏗 Arquitetura do Sistema

### Backend (Laravel 11 - API RESTful)
Atua como o núcleo lógico e de segurança da aplicação.
- **Linguagem:** PHP 8.3
- **Framework:** Laravel 11
- **Banco de Dados:** PostgreSQL (Serverless via NeonDB)
- **Princípios Aplicados:**
  - **Transações Atômicas (`DB::transaction`):** Garantia de consistência de dados (ex: uma mesa só muda de status se a comanda atrelada a ela for gerada com sucesso).
  - **FormRequests & Resources:** Blindagem de segurança na entrada de dados e padronização (JSON) na saída.
  - **Middlewares de Acesso:** Proteção de rotas baseada no Perfil de Usuário (`user_role`), implementando regras de autorização para Gerentes e Garçons.
  - **Containerização:** Preparado para deploy via `Dockerfile` (Otimizado com Apache e `libpq-dev` nativo para suporte a conexões seguras SNI).

### Frontend (React + Vite)
Responsável por consumir a API de forma reativa e fornecer a interface para os usuários (Clientes e Garçons).
- **Linguagem:** TypeScript
- **Framework:** React com Vite
- **Estilização:** TailwindCSS
- **Roteamento:** React Router DOM
- **Princípios Aplicados:**
  - **Componentização:** Telas construídas com componentes modulares e responsivos (Cardápio, Mapa de Mesas).
  - **Gestão de Estado Reativa:** Filtragem de categorias e visualização de itens ocorrem em tempo real na memória do cliente (browser) para evitar sobrecarga de requisições na API.

---

## 🚀 Módulos Implementados

### M00: Base Técnica e Infraestrutura
- Configuração completa do banco de dados PostgreSQL.
- Sistema de migrações e chaves estrangeiras com regras de negócio rigorosas (Cascade/Restrict).
- Implementação de Dockerfile para deploy na nuvem.

### M01: Cardápio e Estoque
- CRUD completo de Produtos e Categorias.
- Interface web com filtros em tempo real simulando um tablet de exibição para os clientes ou caixas.
- Implementação do conceito de **"Snapshot Imutável de Preço"**: Os itens do cardápio salvam o valor estático no momento do pedido, impedindo que flutuações futuras de preço retroajam e corrompam o financeiro do restaurante.

### M02: Mesas e Salão
- Mapa digital e interativo do salão de mesas.
- Fluxo atômico de abertura de mesas vinculado à criação automática de comandas.
- Indicadores visuais do status de ocupação (Livre, Ocupada, Em Fechamento) em tempo real.

---

## 🛠 Como Executar Localmente

### Requisitos
- PHP 8.2+
- Composer
- Node.js & npm
- PostgreSQL

### 1. Clonando o Repositório
```bash
git clone https://github.com/DelcioFDNeto/saborexpress.git
cd saborexpress
```

### 2. Configurando o Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
*Configure o seu `.env` com as credenciais do banco de dados PostgreSQL e rode as tabelas e dados iniciais:*
```bash
php artisan migrate:fresh --seed
php artisan serve
```

### 3. Configurando o Frontend (React)
```bash
cd ../frontend
npm install
```
*Crie um arquivo `.env` na pasta frontend com o link do seu backend:*
```env
VITE_API_URL=http://localhost:8000
```
*Inicie o servidor de desenvolvimento:*
```bash
npm run dev
```

---

## 🌐 Deploy (Produção)
- **Backend:** Hospedado via Docker na Render (`https://render.com`).
- **Frontend:** Hospedado via Vercel (`https://vercel.com`).
- **Branch Strategy:** O desenvolvimento ocorre na branch `dev`, enquanto a `prod` atua como fonte da verdade (Main) e gatilho de Continuous Deployment.

*Desenvolvido em 2026 como projeto de avaliação acadêmica.*
