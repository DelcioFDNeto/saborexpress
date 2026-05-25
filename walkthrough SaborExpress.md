# Documentação Oficial: SaborExpress 🚀
**Data de Compilação:** Maio de 2026
**Fase Atual:** Base, Infraestrutura (M00), Cardápio (M01) e Salão (M02) Concluídos.

Este documento serve como o mapa definitivo de **literalmente tudo** o que foi projetado, codificado e hospedado no SaborExpress até o momento. A arquitetura segue rigorosamente o padrão **MVC desacoplado**, onde o backend (Laravel 11) age puramente como uma API RESTful e o frontend (React + Vite) consome esses dados reativamente.

---

## 1. Infraestrutura e DevOps (M00)

A base do projeto foi projetada para ser robusta, moderna e Serverless.

### Banco de Dados (Neon PostgreSQL)
- **Tecnologia:** PostgreSQL hospedado na nuvem serverless da Neon.
- **Resolução de SNI:** Como o driver nativo `libpq.dll` do Windows/XAMPP não possui suporte nativo ao SNI exigido pelo Neon, criamos um *workaround* oficial conectando a variável `DB_PASSWORD` com o prefixo `endpoint=...;` no ambiente local.
- **Migrações e Seeders:** A estrutura do banco foi criada pensando em escalabilidade e integridade referencial. Chaves estrangeiras (Foreign Keys) foram configuradas com deleção em cascata (Cascade) ou restrição (Restrict) dependendo da regra de negócio.

### Hospedagem (Render e Vercel)
- **Backend Dockerizado:** Para o Deploy contínuo no [Render.com](https://render.com), o PHP puro não é mais suportado nativamente. Portanto, configuramos um **Dockerfile** na pasta `/backend` utilizando a imagem `php:8.3-apache`. O container instala a versão mais recente do `libpq-dev` (que suporta SNI nativamente) e injeta o `mod_rewrite` do Apache para garantir que as rotas do Laravel funcionem.
- **Frontend Dinâmico:** O React foi configurado para ler a URL do servidor através da variável de ambiente `import.meta.env.VITE_API_URL`, tornando-o capaz de alternar de `localhost:8000` para a URL do Render em produção sem alterar uma linha de código.

### Segurança e Performance
- **CORS:** Liberado globalmente (`*`) no Laravel 11 para que requisições originárias da Vercel não sejam bloqueadas.
- **Middleware `CheckRole`:** Um filtro rigoroso implementado na API. Ele checa o campo `user_role` de quem faz a requisição e devolve **403 Forbidden** se um garçom tentar acessar uma rota destinada a gerentes.
- **Paginação de Dados:** Consultas massivas ao banco de dados no Laravel (`Product::all()`) foram refatoradas para utilizar paginação nativa (`paginate(30)`). Isso impede que a aplicação sobrecarregue a memória com payloads enormes.

---

## 2. Cardápio e Estoque (M01)

Este módulo é responsável por exibir aos clientes os itens disponíveis para venda, categorizados dinamicamente.

### Modelagem de Dados
- **Categorias (`categories`)**: Identificadores macro (Ex: Pizzas, Bebidas, Sobremesas).
- **Produtos (`products`)**: Atrelados às categorias. Possuem nome, descrição, preço (`decimal 10,2`) e uma flag booleana `is_available` para ocultar itens que acabaram no estoque.

### API Resources e Validações
- **FormRequests:** Classes injetadas nos controllers (`StoreProductRequest`, etc.) garantem que nenhum dado inválido (como um produto sem preço) chegue ao banco.
- **Resources:** O Laravel transforma a saída do banco de dados utilizando `ProductResource` e `CategoryResource`. Isso encapsula as colunas reais do banco, entregando um JSON limpo e padronizado para o frontend.

### Frontend
- Criado o arquivo `Menu.tsx`.
- Uma página focada na reatividade: Todos os dados chegam via requisição Assíncrona (`axios.get`) e são salvos em estado local. Filtros de categoria operam em memória no navegador do cliente, oferecendo respostas instantâneas na tela sem forçar novos *fetches* na API.
- **Renderização de Imagens:** O layout dos cartões foi atualizado para exibir imagens dinâmicas vindas do banco (`image_url`), possuindo um *fallback* inteligente (placeholder) caso a imagem esteja em branco.

---

## 2.5 Refinamentos de Arquitetura: RBAC e Autenticação

Para garantir que o sistema abranja os **6 atores acadêmicos** descritos no escopo, implantamos um sistema completo de RBAC (Role-Based Access Control).

## 2. Autenticação e Segurança (Role-Based Access Control)
O SaborExpress não é um sistema "aberto". Criamos uma barreira rígida usando o Laravel Sanctum e React Context API:
- **Cadastro e Login (`/register` e `/login`):** Novas contas podem ser criadas definindo cargos específicos (`waiter`, `kitchen`, `cashier`, `delivery_driver`, `administrator`).
- **Múltiplas Visões Seguras:** O frontend usa um componente `ProtectedRoute` que avalia a *role* e o *token*. Um Garçom não consegue abrir a URL do Painel Administrativo; ele é barrado e devolvido à sua área permitida.
- **Seeders de Teste:** O banco já foi populado com 6 contas para testes automáticos, possuindo os e-mails `admin@saborexpress.com`, `waiter@...`, `kitchen@...`, `cashier@...`, `delivery@...` e `client@...` (todos com a senha genérica `password`).
- **Proteção Frontend (React AuthContext):** A navegação agora é inteligente e baseada no perfil. Garçons têm acesso ao Cardápio e Mesas. A Cozinha só enxergará o KDS no futuro. Acessar `/mesas` deslogado redireciona automaticamente para a nova tela de `/login`.

---

## 3. A Central de Mesas e Pedidos (M01 e M02)

O módulo que trouxe interatividade e segurança para a experiência do garçom, simulando o mapa de mesas do salão em tempo real.

### Regra de Negócio: Transações e Snapshot de Preço
> [!IMPORTANT]
> **A Regra de Ouro do Sistema:**
> Se uma Pizza custa R$ 40,00 hoje, mas amanhã o administrador alterar para R$ 45,00, **as comandas anteriores não podem sofrer reajuste retroativo**.
> Por isso, configuramos desde já a fundação para o M03: Quando um item é adicionado a um pedido, o controlador consulta o preço do produto naquele segundo e **congela o valor** (snapshot) salvando-o na coluna `unit_price` da tabela `order_items`.

### O Método Atômico: `openTable()`
- Desenvolvemos no `TableController` a rota que altera o status da mesa de `Livre` para `Ocupada`.
- Utilizamos a ferramenta mais segura para lidar com dinheiro e consistência de dados: **`DB::transaction()`**. 
- Se a mesa mudar para Ocupada, mas ocorrer uma falha repentina que impeça a criação da Comanda (Order) atrelada àquela mesa, o banco inteiro aciona um `rollBack()` e cancela a alteração de status. Isso elimina o risco de termos "Mesas Ocupadas sem comandas fantasma" ou "Comandas ativas em mesas livres".

### O Mapa de Mesas Interativo (Frontend)
- Foi criada a tela `/mesas` (`Tables.tsx`).
- O layout utiliza o TailwindCSS para exibir um **Grid Responsivo** colorido:
  - **Verde (Livre):** Interativas e pulsam.
  - **Vermelho (Ocupada):** Desativadas com indicativo sonoro/visual ("ping") avisando atividade.
  - **Amarelo (Fechamento):** Fila de espera para caixa/limpeza.
- **Abertura Rápida:** Ao clicar em uma mesa verde, um Modal fluido é aberto perguntando o "Nome e Telefone" opcional do cliente. Ao aprovar, o front consome a rota de operação atômica e atualiza a mesa para ocupada em tempo real.

### Agrupamento e Transferência de Mesas (Req 2.4)
Para lidar com a dinâmica do salão (ex: clientes mudando de mesa ou juntando grupos), implementamos ações atômicas:
- **Transferência:** Move a comanda ativa para uma mesa livre. A mesa antiga volta a ficar verde e a nova passa a ser vermelha.
- **Agrupamento (Merge):** Ao juntar duas mesas ocupadas, o banco de dados funde todos os itens consumidos (fazendo um `update` na foreign key de `order_items`) e soma os valores no `total_amount` da mesa alvo, cancelando a comanda antiga para manter o histórico limpo e liberando a mesa de origem.

### Alimentação Automática (Seeders)
- Como é um projeto com viés acadêmico, desenvolvemos o `TableSeeder` que já gera automaticamente **12 Mesas padronizadas** no banco de dados com capacidades variadas (2 a 6 pessoas), permitindo que qualquer avaliador teste o visual do salão no momento em que roda `migrate:fresh --seed`.

---

> [!TIP]
> **Próxima Parada: Módulo 03 (Comandas e Carrinho de Pedidos)**
> A fundação está sólida. O próximo passo lógico é adentrar as mesas ocupadas:
> - Criar a tela de visão interna da Comanda (Orders).
> - Listar os produtos atrelados à ela.
> - Criar o fluxo (Carrinho de compras) para o Garçom inserir produtos, disparando o snapshot de preço no Laravel.

---

## 4. Comandas e Carrinho de Pedidos (M03)

Neste módulo consolidamos a gestão interna da mesa, permitindo visualizar a conta do cliente e realizar lançamentos de produtos de forma reativa e segura.

### Lógica de Backend e Integridade
- **Relacionamentos (Eloquent):** O `OrderController@show` agora carrega ativamente a comanda e todos os produtos atrelados (`$order->load('items.product', 'table', 'user')`).
- **Snapshot e Recálculo Automático:** No `addItem`, além de registrar o snapshot imutável do preço (guardando o valor atual do produto na coluna `unit_price` do `order_items`), o backend recalcula e atualiza automaticamente o `total_amount` da comanda.
- **Bug Fix de Abertura:** A correção de integridade referencial foi aplicada. A comanda agora associa corretamente o Garçom que realizou a abertura (`user_id`).

### Frontend: Visão da Comanda e Modal de Carrinho
- **Rotas Dinâmicas:** Implementação da rota protegida `/mesas/:tableId`. No Mapa do Salão, as mesas "Ocupadas" tornaram-se botões clicáveis que redirecionam para a visão detalhada da comanda ativa.
- **Visão da Comanda (`OrderDetails.tsx`):**
  - Mostra a mesa, garçom responsável e o status do pedido.
  - Lista em tempo real os itens consumidos (quantidade, preço unitário, status do preparo e subtotal).
  - Alerta Visual: Se a cozinha marcar qualquer item como "Pronto", a tela do garçom pisca um Banner interativo para avisar da retirada no balcão (Polling automático de 15 segundos).
- **Carrinho de Produtos Avançado (`OrderCartModal.tsx`):**
  - Modal imersivo projetado para uso rápido no salão.
  - O cardápio é renderizado separadamente por abas de Categorias.
  - Ao clicar em "Adicionar", ele expande um mini formulário para o Garçom capturar a **quantidade** e **observações customizadas** (Ex: "Sem cebola, bem passado") antes do envio à cozinha.

### Módulo Integrado de Cozinha (KDS - Kanban)
- **Visão Cronológica (`Kitchen.tsx`):** Rota `/cozinha` acessível por usuários do perfil `kitchen`.
- **Máquina de Estados:** Traz 3 colunas de Kanban: `Pendente` -> `Em Preparo` -> `Pronto`. O cozinheiro clica nos botões para avançar os pratos pela linha de produção.
- **Polling Reativo:** A tela recarrega os pedidos silenciosamente a cada 10 segundos, mantendo a cozinha atualizada sem necessidade de usar F5.

---

## 5. Módulo Financeiro e Delivery (M04 & M05)

Construímos a espinha dorsal financeira e de roteamento do SaborExpress, amarrando toda a operação do restaurante!

### Banco de Dados (Integração Neon Serverless)
A base de dados foi expandida para suportar as complexidades lógicas financeiras e de logística:
- **Tabela `payments`**: Relacionamento obrigatório (`cascadeOnDelete`) com a tabela de Comandas (`orders`). Os pagamentos são mapeados para métodos restritos: `PIX`, `Cartão` e `Dinheiro`.
- **Status de Logística**: Coluna `delivery_status` restrita às chaves `Aguardando`, `Em Rota` e `Entregue` inserida na tabela `orders`.

### Motor de Divisão Matemática (O Cérebro do Caixa)
O **PaymentController** resolve todos os gargalos do caixa financeiro e de pagamentos:
> [!NOTE]
> O motor calcula contas complexas com extrema precisão através de 3 cenários de divisão:
> - **Integral:** Pagamento total da conta.
> - **Dividir Igual:** O sistema contorna o temido problema de "dízimas periódicas". Por exemplo, uma conta de R$ 100 dividida para 3 clientes não resulta em erro; o backend lida com a matemática inteiramente em centavos em PHP, gerando as parcelas `R$ 33,34`, `R$ 33,33` e `R$ 33,33` e garantindo R$ 0,00 de perdas!
> - **Por Item:** O caixa possui uma lista de *checkboxes* onde marca exatamente o que o cliente consumiu (ex: 1 Refrigerante e 1 Pizza). A calculadora soma os produtos e inclui o rateio proporcional exato dos 10% de serviço.

A tela administrativa do Caixa (`/caixa`) permite aos operadores:
- Visualizarem quais comandas (Delivery ou Mesas) estão aguardando pagamento.
- Escolher como o cliente deseja pagar.
- Receber pagamentos de forma incremental. (Ex: O sistema registra o cliente pagando a primeira metade no PIX, e subtrai dinamicamente do saldo devedor até a comanda ser validada como `Finalizada`).

### Plataforma Logística do Delivery
- Avanço tátil de Status: Muda a flag para **Em Rota** (Exibindo um visualizador pulsante) e **Entregue**.

### Pré-Fechamento da Mesa (O Fio Condutor)
Implementamos a ponte entre o garçom no salão e o caixa interno.
> [!TIP]
> O Garçom possui agora um botão imponente: **Pedir Fechamento**. Isso dispara um gatilho que tranca a mesa (`status = 'Fechada'`) para impedir novas inserções no OrderCartModal, calcula matematicamente a Taxa de Serviço (10%) direto no banco, e notifica instantaneamente o Painel do Caixa (Dashboard Financeiro) com a cor amarela.

Com a implantação da divisão de contas, KDS logístico e pré-fechamento, o fluxo de vida do restaurante encontra-se **100% holístico e automatizado**:
`Auto-atendimento / Garçom` ➔ `KDS da Cozinha` ➔ `Dashboard do Caixa` ➔ `Painel do Entregador`!

### Gaveta de Caixa e Movimentações Financeiras
Para assegurar a conciliação financeira do restaurante, foi integrado um painel de Gaveta (Histórico de Caixa):
- **Sangria:** Retiradas do caixa devidamente auditadas e subtrativas do saldo do dia.
- **Suprimento:** Adições de troco contabilizadas.
- **Estorno de Vendas:** Caso um pagamento tenha sido lançado errado, o operador pode acionar um botão na timeline de movimentações diárias para gerar um refund e devolver a conta para aberto.
- O sistema calcula o saldo líquido em tempo real de todas as vendas e retiradas.

> [!IMPORTANT]
> **Conclusão Geral:** O **SaborExpress** agora é um ecossistema full-stack fechado. Ele abrange perfeitamente desde o Delivery e o Salão de Mesas, passando pela tela KDS da Cozinha, controle rigoroso financeiro no Caixa, painel logístico do Entregador, até o Dashboard Gerencial!

## 6. Painel Gerencial & Relatórios Visuais (M06)

O módulo gerencial do SaborExpress foi construído para entregar Inteligência de Negócio (BI) de forma imersiva e reativa ao administrador.

### Lógica de Agregação e Filtros (Backend)
- **Filtros Temporais Inteligentes:** O `DashboardController` aceita parâmetros na query string (`?period=`) como *Hoje*, *7 Dias*, *30 Dias* e *Tudo*. O backend intercepta as requisições para agregar dados exatos baseados na coluna `created_at` (do banco de dados).
- **Faturamento no Tempo:** Implementamos um agrupamento (`GROUP BY DATE(created_at)`) que mapeia os ganhos financeiros diários para alimentação direta de visualização cronológica.

### Interface Gráfica e BI (Frontend)
- Adicionada a dependência **Recharts** para construção de componentes visuais (SVG) reativos e amigáveis.
- **Gráfico de Faturamento (AreaChart):** Uma representação no tempo da evolução de vendas do período selecionado, destacando fluxos de receita através de preenchimentos e delineamentos em verde esmeralda.
- **Gráfico de Curva ABC (BarChart):** Ranqueamento volumétrico cruzado, provando quais são os 10 produtos de maior escoamento (Volume) e maior peso financeiro (Receita). As 3 barras principais (Campeões de Venda) recebem uma coloração âmbar exclusiva em destaque.
- **Micro-Interações e UX:** Todos os gráficos e cards de KPI possuem *Tooltips* formatadas dinamicamente para a moeda local (R$), atualizando em tempo real com o uso do seletor de Período.

---

## 7. Tempo Real e Micro-interações (M08)
Foi implementado o **Laravel Reverb** (WebSockets) juntamente com o **Laravel Echo**.
Sempre que um Garçom (no tablet) ou o Delivery (cliente final) envia um novo pedido, ou adiciona itens, o evento `OrderUpdated` é disparado. A tela KDS da Cozinha, que está "ouvindo" esse canal, se atualiza instantaneamente e toca um aviso sonoro (sino). A mesma reatividade acontece no Caixa.
Além disso, foram adicionados Toasts (`sonner`) para feedback visual, Skeleton Loaders para carregamentos e o ViaCEP no Delivery.

### 🚀 Deploy do Reverb (Produção)
Ao mover a aplicação para Go-Live (como na AWS, Forge, Render, ou VPS), o **Reverb** requer considerações especiais:
1. O servidor Reverb deve rodar como um **Daemon** contínuo. Em uma VPS (Ubuntu), utiliza-se o `Supervisor` para garantir que o processo `php artisan reverb:start` permaneça rodando em background.
2. Certificados SSL (`wss://`) precisam ser mapeados nos parâmetros de inicialização do Reverb ou via proxy reverso (Nginx) roteando as portas. Em plataformas PaaS (Heroku/Render), pode ser mais viável trocar o `.env` de Reverb nativo para a API externa do **Pusher**.

---

## 8. Refinamento de Engenharia (Bug Bash Final)
Para assegurar a perfeição deste projeto, foi conduzida uma bateria final de testes sistêmicos, prevenindo cenários de falha na integração entre os módulos:
- **Resiliência da Cozinha (M03 x M04):** A tela da Cozinha (`Kitchen.tsx`) foi protegida contra exceções de tela branca (*null pointer*) ao receber pedidos do Delivery (que não possuem vínculo com a tabela de Mesas). Uma renderização dinâmica exibe uma tag vibrante de **"DELIVERY"** no KDS de forma elegante.
- **Roteamento Logístico Correto:** Foi desenhada no backend uma rota exclusiva para manipulação de status de Entregador (`PUT /api/orders/{order}/delivery-status`). Isso impede que o painel do motoqueiro dispare conflitos ao acessar a controladora central financeira do Caixa.

---

## 9. Fusão de Engenharia & Centralização (Parceiros ↔ Premium)

Realizamos uma integração completa e profunda entre o backend refatorado pelos parceiros (introduzindo padrões avançados) e a nossa interface premium de alta fidelidade:

### Integração de Padrões Arquiteturais (Backend)
- **Actions & Repositories**: Consolidamos a utilização de mais de 16 Actions desacopladas e o padrão de Repositórios Eloquent para manipulação segura e isolada de dados.
- **Auditoria de Eventos**: Implementamos o monitoramento automático de ações críticas (criação de comandas, alteração de produtos, pagamentos, logins). Cada ação gera logs detalhados na tabela `audit_events` com ID do usuário e dados históricos.
- **Tratamento de Erros Global**: Respostas JSON consistentes e padronizadas no `bootstrap/app.php` para todas as exceções operacionais.

### Centralização e Segurança do Frontend
- **Cliente API Centralizado (`src/lib/api.ts`)**: Migramos todas as páginas e componentes do frontend para utilizar um cliente Axios centralizado, eliminando variáveis ad-hoc de `apiUrl`. A instância inclui inserção automatizada e dinâmica de tokens Sanctum.
- **Correção de Permissões de Acesso (RBAC)**: Separamos as rotas no React Router permitindo que o perfil `delivery` (Entregador) acesse corretamente o painel `/entregas`, enquanto a rota `/cozinha` permanece exclusiva para a equipe KDS.

---

## 10. Console Gerencial Unificado (Abas Administrativas)

Consolidamos o painel `/dashboard` (exclusivo para `administrator`) em uma central gerencial unificada, eliminando telas espalhadas e organizando o controle operacional em 5 abas rápidas e reativas:

1. **Aba de Indicadores**: Monitoramento em tempo real com Recharts da receita acumulada no tempo e curva ABC de produtos campeões de venda.
2. **Aba de Cardápio (Produtos & Categorias)**: CRUD completo de categorias e produtos. Controles inline para ativar/desativar produtos (ligado ao patch de disponibilidade) e monitoramento de estoques mínimos.
3. **Aba de Mesas**: Manutenção e criação da estrutura física de mesas (números e capacidades) do salão.
4. **Aba de Equipe**: Controle total de recursos humanos corporativos, permitindo criar novas contas (Garçom, Cozinha, Caixa, Entregador e Admin), inativar ou ativar operacionais, redefinir senhas ou excluir cadastros.
5. **Aba de Auditoria**: Visualizador interativo e paginado de eventos de logs coletados pelo banco de dados, com filtros cruzados por tipo de evento, usuário e datas.

---

## 11. Fluxo de Retirada (Takeout) & Inicialização de Dados

Para ampliar os canais de atendimento, implementamos o fluxo de **Retirada no Estabelecimento (Takeout)**:

* **Backend**: Criada a rota `POST /api/orders/takeout` e implementado o método `storeTakeout` no `OrderController.php`, que abre comandas sem exigir CEP ou endereço físico, utilizando a tag `'Takeout'` e setando o status inicial como `'Aguardando Retirada'`.
* **Frontend**: Incluído um seletor visual animado no checkout (`DeliveryClient.tsx`) que oculta condicionalmente todos os inputs de preenchimento e busca do CEP, simplificando a compra para o cliente final.
* **Automação do Banco**: Atualizado o `DatabaseSeeder.php` para utilizar o `MenuSeeder` de forma nativa. O comando `php artisan migrate:fresh --seed` agora recria todo o banco e popula o cardápio automaticamente com as fotos de altíssima qualidade vindas do Unsplash, além de todas as 12 mesas e usuários de testes acadêmicos.

---

## 12. Autoatendimento e Reservas Online

O ecossistema se expandiu para oferecer poder diretamente às mãos dos clientes fiéis.

- **Painel do Cliente (`Minhas Reservas`)**: Clientes devidamente cadastrados logados com seu perfil têm acesso a uma interface web intuitiva onde conseguem enxergar o mapa de mesas do salão.
- **Reserva Online Real-time**: Com um clique de calendário, os clientes podem reservar previamente mesas, adicionando notas e pedidos especiais (Ex: cadeiras de bebê).
- O backend processa validações complexas, negando choques de horário (com 2 horas de tolerância entre ocupantes da mesma mesa), e as informações chegam na mesma tela dos recepcionistas do restaurante.

---
**Status Final do Projeto:** Ecossistema Integrado, 100% Funcional, Responsivo e Escalável! 🚀
