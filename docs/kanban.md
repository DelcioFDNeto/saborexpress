# Kanban do Projeto

Este documento acompanha o estado atual do SaborExpress. Ele deve ser atualizado conforme novas funcionalidades forem concluídas ou priorizadas.

## Concluído

- Estrutura inicial em monorepo com `backend/`, `frontend/` e `docs/`.
- Scripts de apoio na raiz do projeto.
- Docker Compose para PostgreSQL local.
- Backend Laravel configurado com PostgreSQL.
- Frontend React com Vite, TypeScript e Tailwind CSS.
- Autenticação com Laravel Sanctum.
- Seeders de usuários por perfil.
- Seeders de mesas.
- Middleware de autorização por perfil.
- Cardápio público para leitura de categorias e produtos.
- Proteção de escrita de categorias e produtos para administrador.
- CRUD backend de categorias.
- CRUD backend de produtos.
- CRUD backend de mesas.
- Padronização dos enums de mesas e pedidos.
- Abertura transacional de mesa com criação de comanda.
- Prevenção de comanda ativa duplicada para a mesma mesa.
- Backend do módulo de comandas.
- Especificação OpenAPI da API atual.
- Visualização da documentação com Scalar.
- Inclusão de item em comanda com snapshot de preço.
- Atualização de quantidade, observação e status de item.
- Remoção de item da comanda.
- Recálculo do total da comanda no backend.
- API Resources para categorias, produtos, comandas e itens de comanda.
- Form Requests para operações de comanda.
- Actions Laravel para regras de negócio de comandas.
- Repositories para usuários, categorias, produtos, mesas, comandas e itens de comanda.
- Cliente HTTP centralizado no frontend.
- Tela de login.
- Tela de cardápio.
- Tela de mapa de mesas.
- Guia local `module-guidelines-laravel.md` ignorado pelo Git.

## Em andamento

- Consolidação da documentação técnica.
- Separação clara entre funcionalidades implementadas e funcionalidades planejadas.
- Validação do fluxo backend de comandas antes de iniciar novas telas no frontend.

## A fazer

- Criar seeders de categorias e produtos.
- Implementar tela frontend de comanda por mesa.
- Permitir que o garçom adicione produtos à comanda pelo frontend.
- Implementar fluxo de envio de itens para cozinha.
- Criar painel da cozinha.
- Criar fluxo de fechamento de conta.
- Implementar pagamento.
- Liberar mesa após pagamento ou cancelamento.
- Criar fluxo de caixa.
- Criar fluxo de delivery.
- Criar telas administrativas para categorias e produtos.
- Criar tela administrativa para mesas.
- Melhorar tratamento global de erros no frontend.
- Padronizar mensagens de erro da API.
- Criar migrations de alteração para bancos persistidos, caso o projeto deixe de usar `migrate:fresh` em desenvolvimento.
- Adicionar testes automatizados quando o escopo permitir.

## Bloqueado ou dependente de decisão

- Definir se o cardápio público terá paginação infinita, busca ou filtros avançados.
- Definir se o caixa poderá alterar itens da comanda ou apenas fechar pagamento.
- Definir se cozinha será baseada em itens individuais ou em pedidos agrupados.
- Definir se delivery será tratado como pedido sem mesa ou como módulo separado.
