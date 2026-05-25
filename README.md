# SaborExpress

SaborExpress é um sistema acadêmico para gestão de restaurantes. O projeto contempla cardápio, controle de mesas, autenticação por perfil e a base de comandas para registrar itens consumidos em uma mesa.

O objetivo principal é demonstrar uma arquitetura desacoplada, com backend responsável pelas regras de negócio e pela persistência dos dados, enquanto o frontend consome a API e apresenta as telas operacionais.

## Arquitetura

O projeto segue uma arquitetura cliente-servidor em formato de monorepo.

O backend é uma API REST construída com Laravel. Ele concentra autenticação, autorização, validações, regras de negócio, transações, migrations, seeders e acesso ao banco de dados.

O frontend é uma aplicação React com Vite. Ele consome a API HTTP, mantém estado de interface e apresenta as telas de cardápio, login e mapa de mesas.

```text
saborexpress/
  backend/        API Laravel
  frontend/       Aplicação React com Vite
  docs/           Documentação técnica e acompanhamento do projeto
  docker-compose.yml
  package.json    Scripts de apoio do monorepo
```

## Monorepo

Este repositório mantém backend e frontend no mesmo projeto, mesmo usando tecnologias diferentes. Cada aplicação preserva suas próprias dependências, comandos e arquivos de configuração, enquanto a raiz centraliza tarefas comuns de desenvolvimento.

Essa organização facilita:

- executar comandos a partir da raiz;
- manter documentação única do projeto;
- versionar backend e frontend de forma coordenada;
- compartilhar infraestrutura local, como o banco PostgreSQL via Docker Compose;
- acompanhar a evolução dos módulos em um único fluxo.

## Tecnologias

### Backend

- PHP 8.2 ou superior
- Laravel 12
- Laravel Sanctum
- PostgreSQL
- Eloquent ORM
- Repository pattern
- Form Requests
- API Resources
- Docker para deploy e ambiente local auxiliar

### Frontend

- Node.js 22 ou superior
- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- Axios
- React Router

## Funcionalidades atuais

- Autenticação via Laravel Sanctum.
- Perfis de usuário: administrador, garçom, cozinha, caixa, entrega e cliente.
- Controle de acesso por perfil no backend.
- CRUD administrativo de usuários, troca de senha, ativação e desativação.
- Tratamento global de erros da API com payload padronizado.
- Auditoria e histórico operacional com eventos consultáveis pelo administrador.
- Cardápio público para leitura de categorias e produtos.
- Operações protegidas para criação, edição e remoção de categorias e produtos.
- Busca, filtros, disponibilidade e estoque simples de produtos.
- Cadastro e consulta de mesas.
- Abertura de mesa com criação transacional de comanda.
- Reserva, cancelamento de reserva, transferência, junção e fluxo de limpeza de mesas.
- Módulo backend de comandas, com inclusão, atualização e remoção de itens.
- Snapshot de preço no item da comanda.
- Recálculo do total da comanda no backend.
- Fluxo de cozinha para listar itens pendentes, agrupar por comanda, iniciar preparo, marcar item como pronto e cancelar item.
- Entrega de item pronto na mesa.
- Solicitação de fechamento da comanda.
- Cancelamento de comanda aberta.
- Registro de pagamento da comanda.
- Liberação de mesa após pagamento.
- Seeders de usuários, mesas, categorias e produtos para ambiente local ou Docker.
- Telas frontend de cardápio, login e mapa de mesas.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- PHP 8.2 ou superior
- Composer
- Docker, caso deseje usar o PostgreSQL local via Docker Compose

## Executando o projeto

### Banco de dados local

Na raiz do projeto, execute:

```bash
npm run dev:db
```

Esse comando sobe um PostgreSQL local com as seguintes credenciais:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=saborexpress
DB_USERNAME=saborexpress
DB_PASSWORD=saborexpress
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Por padrão, o frontend espera a API em:

```env
VITE_API_URL=http://localhost:8000
```

## Scripts da raiz

```bash
npm run dev          # executa backend e frontend em paralelo
npm run dev:backend  # executa php artisan serve em backend/
npm run dev:frontend # executa Vite em frontend/
npm run dev:db       # sobe o PostgreSQL local
npm run build        # gera build do frontend
npm run lint         # executa lint do frontend
npm run migrate      # executa migrations do Laravel
npm run seed         # executa seeders do Laravel
npm run fresh        # recria o banco e executa seeders
npm run api:routes   # lista rotas da API
```

## Documentação

- [API atual](docs/API.md)
- [Kanban do projeto](docs/kanban.md)

A API também possui uma especificação OpenAPI em `backend/public/openapi.yaml`. Com o backend em execução, a documentação interativa pode ser acessada em:

```text
http://localhost:8000/docs/api
```

## Dados Iniciais

Ao executar `php artisan migrate:fresh --seed`, o backend cria dados básicos para desenvolvimento:

- usuários por perfil operacional;
- mesas numeradas;
- categorias de cardápio;
- produtos de demonstração com preços e estoque inicial quando aplicável.

Esses dados permitem testar autenticação, cardápio, abertura de mesa, comanda, cozinha, entrega na mesa, fechamento e pagamento sem cadastro manual inicial.

## Observações

O projeto ainda está em desenvolvimento. O backend já possui base operacional para autenticação, usuários, cardápio, mesas, comandas, cozinha, entrega na mesa, fechamento, pagamento integral, auditoria e tratamento global de erros. Ainda faltam evoluções como pagamento parcial, divisão de conta, relatórios, fluxo completo de delivery/retirada, caixa completo e integração dessas novas rotas no frontend.

Como houve padronização de enums em migrations existentes, bancos locais criados anteriormente podem precisar ser recriados com `php artisan migrate:fresh --seed`.
