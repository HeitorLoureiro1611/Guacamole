# Guacamole — Documentação do Front-end

Registro vivo do front-end: o que existe, como funciona e por que foi feito assim.
Atualizado a cada mudança. A seção **Histórico** no fim lista tudo em ordem.

---

## 1. Visão geral

Guacamole reúne em um só lugar o conteúdo do canal **Curso em Vídeo** (YouTube),
apresentado como cursos. Público: jovens entrando agora na área de tecnologia.

Escopo atual: o **fluxo completo do usuário**: início, catálogo, curso, aula, perfil, login, cadastro,
recuperação de senha e página 404. Todas as chamadas ao backend passam por `src/api.js`.
O contrato da API está em `/api_cursos.md`, na raiz do repositório.
Só a recuperação de senha ainda simula o envio (não há rota para ela na API).

Regra do projeto: o trabalho de front-end fica só na pasta `frontend/`. A pasta `backend/` não é tocada.

## 2. Como rodar

```bash
cd frontend
npm install        # só na primeira vez
npm run dev        # servidor local em http://localhost:5173
npm run build      # gera a versão final em frontend/dist
```

Endereço do backend: por padrão `http://localhost:8000`. Para trocar, crie `frontend/.env` com:

```
VITE_API_URL=https://endereco-do-backend
```

O backend precisa liberar CORS para o endereço do front (em desenvolvimento, `http://localhost:5173`).

Rotas:

| Rota | Página | Precisa de login? |
|---|---|---|
| `/` | Início | não |
| `/cursos` | Catálogo (`?page=N` para paginar) | não |
| `/cursos/:id` | Curso: detalhes, aulas, salvar, progresso | não (salvar e progresso pedem login) |
| `/aulas/:id` | Aula: vídeo, concluir, anterior/próxima | não (concluir pede login) |
| `/perfil` | Perfil: dados, cursos salvos, sair | **sim** |
| `/login` | Login | só para quem não está logado |
| `/cadastro` | Cadastro | só para quem não está logado |
| `/recuperar-senha` | Recuperação de senha | não |
| qualquer outra | Página 404 | não |

Quem tenta uma ação que exige login (salvar curso, concluir aula, abrir o perfil) vai para o login
e, depois de entrar, **volta para a página onde estava**.

## 3. Tecnologias

| Ferramenta | Para quê |
|---|---|
| **Vite** | servidor de desenvolvimento e build |
| **React 19** | componentes da interface |
| **React Router 7** | navegação entre páginas sem recarregar |
| **Tailwind CSS 4** | estilos direto nas classes do HTML |
| Google Fonts | JetBrains Mono (texto) e Archivo Black (títulos) |

Não há outras dependências.

## 4. Estrutura de pastas

```
frontend/
├── index.html              página base: fontes, favicon, título
├── vite.config.js          liga React e Tailwind no Vite
├── package.json            dependências e scripts
├── DOCS.md                 este documento
├── public/
│   └── favicon.svg         ícone de terminal da aba
└── src/
    ├── main.jsx            ponto de entrada + rotas
    ├── api.js              chamadas ao backend (todas as rotas da API) + token
    ├── useApi.js           busca dados de uma rota e controla carregando/erro
    ├── index.css           tema (cores, fontes) e efeitos globais
    ├── components/
    │   ├── AppLayout.jsx   menu, conteúdo e rodapé das páginas do app
    │   ├── AuthLayout.jsx  layout dividido das telas de acesso
    │   ├── Cow.jsx         vaca do cowsay com fala configurável
    │   ├── Form.jsx        campo, botões, aviso e utilitários
    │   └── ui.jsx          título, barra de progresso, card de curso, paginação, carregando, erro
    └── pages/
        ├── Home.jsx            /
        ├── Cursos.jsx          /cursos
        ├── Curso.jsx           /cursos/:id
        ├── Aula.jsx            /aulas/:id
        ├── Perfil.jsx          /perfil
        ├── NaoEncontrado.jsx   404
        ├── Login.jsx
        ├── Cadastro.jsx
        └── RecuperarSenha.jsx
```

## 5. Identidade visual

Referências: interfaces de **Watch Dogs 2** (arte ASCII, brutalismo digital, cultura hacker)
e a organização de cursos do **Laracasts**. Nenhuma analogia com a comida guacamole.

### Cores (definidas em `src/index.css`, bloco `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `void` | `#030303` | fundo (quase preto absoluto) |
| `panel` | `#0a0a0b` | fundo de campos e caixas |
| `line` | `#1c1c1f` | bordas |
| `mute` | `#8a8a93` | texto secundário |
| `cyan` | `#8ff0f4` | cor principal, botões, login |
| `orange` | `#ffb38a` | destaque, cadastro |
| `pink` | `#ff9cc6` | erros, sombra do botão, recuperação |

As três cores de destaque são **pastel**. Cada tela usa uma delas no título.
Para trocar uma cor no site inteiro, basta mudar o valor no `@theme`.
No código, as cores viram classes do Tailwind: `text-cyan`, `bg-pink`, `border-line` etc.

### Tipografia

- **JetBrains Mono**: todo o texto, com cara de terminal.
- **Archivo Black**: títulos grandes em caixa alta (`font-display`).

### Efeitos (em `src/index.css`)

| Efeito | O que faz |
|---|---|
| Granulado | textura de filme sobre a tela toda, gerada por SVG no próprio CSS (sem arquivo de imagem), em 6% de opacidade para manter o preto profundo |
| `.glitch` | o logo ASCII "treme" com sombras coloridas a cada 6 s |
| `.caret` | cursor `_` piscando |
| Anel de foco | todo link e botão ganha um contorno laranja ao ser focado pelo teclado (`:focus-visible`) |
| `pre` sem ligaduras | a fonte JetBrains Mono junta caracteres como `\|\|--`, o que quebrava a arte ASCII; isso foi desligado nos blocos `<pre>` |

Quem ativa "reduzir movimento" no sistema não vê as animações.

## 6. Componentes

### `AppLayout.jsx`

Moldura de todas as páginas do app (tudo menos login, cadastro e recuperação).
- **Menu:** logo (leva ao início), Início, Cursos e **Entrar** (deslogado) ou **Perfil** (logado).
  Em telas menores que 360px o "Início" some, porque o logo já leva para lá.
- **Link "Pular para o conteúdo":** aparece só para quem navega pelo teclado.
- **Rodapé:** a vaquinha em pé sobre a linha do rodapé (regra da vaquinha).

| Prop | O que é |
|---|---|
| `docTitle` | texto da aba do navegador (vira "`docTitle` · Guacamole") |
| `cowSays` | fala da vaca nesta página |

### `ui.jsx`

| Export | O que é |
|---|---|
| `PageTitle` | rótulo `// algo` + título grande + subtítulo |
| `Progress` | barra de progresso em ASCII `[████░░░░] 40%`, lida corretamente por leitores de tela |
| `CourseCard` | card de curso com faixa colorida no topo; com `progress`, mostra a barra no lugar de "ver curso" |
| `Pagination` | botões anterior/próxima + "página X de Y" |
| `Loading` | `> carregando_` |
| `ErrorBox` | aviso de erro com "tentar de novo" (ou link para os cursos, se for 404) |
| `ACCENTS`, `pad` | cores que alternam entre os cards; número com 2 dígitos (`7` → `07`) |

### `useApi.js`

`useApi(() => api.algo(), [dependências])` busca os dados quando a página abre (ou quando as dependências mudam)
e devolve `{ data, error, loading, reload, setData }`.
- `reload()` busca de novo (botão "tentar de novo").
- `setData(...)` atualiza o que está na tela depois de uma ação (salvar curso, concluir aula) sem buscar tudo de novo.
- Respostas que chegam depois de o usuário já ter mudado de página são ignoradas.

### `AuthLayout.jsx`

Layout compartilhado pelas três telas de acesso.

**Desktop (≥ 1024 px):** duas colunas.
- **Esquerda (painel da marca, decorativo):**
  1. no alto: logo "GUACAMOLE" em ASCII (fonte figlet *ANSI Shadow*) e o texto "Todo o acervo…";
  2. embaixo: a tabela "$ sync --playlists" com trilhas de exemplo e a **vaca do cowsay em pé sobre ela**;
  3. **código HTTP** grande e apagado no canto inferior esquerdo, um por página (ver tabela abaixo).
- **Direita:** cabeçalho com a marca, o título da página e o formulário.

**Celular:** o painel esquerdo some e o formulário ocupa a tela toda.

Propriedades (props):

| Prop | Tipo | Exemplo |
|---|---|---|
| `docTitle` | texto | texto da aba do navegador |
| `step` | texto | `"01 / acesso"`, rótulo da etapa no topo e acima do título |
| `title` | JSX | título grande |
| `subtitle` | texto | frase abaixo do título (opcional) |
| `children` | JSX | o formulário |
| `footer` | JSX | link para outra tela (opcional) |
| `cowSays` | texto | fala da vaca nesta página |
| `httpCode` | texto | código HTTP do fundo do painel |

Códigos HTTP de cada página (escolhidos pelo significado):

| Página | Código | Por quê |
|---|---|---|
| Login | `401` | *Unauthorized*: você ainda não se identificou |
| Cadastro | `201` | *Created*: uma conta nova vai ser criada |
| Recuperar senha | `404` | *Not Found*: a senha "sumiu" |

O painel esquerdo tem `aria-hidden` porque é só decoração: leitores de tela vão direto ao formulário.

> ⚠️ A lista de trilhas (`FEED`) é fixa no código, com números de exemplo. Será trocada pelos dados reais da API do YouTube quando o backend existir.

### `Cow.jsx`

A vaca clássica do **cowsay** (`<Cow says="..." />`). O balão é montado automaticamente
do tamanho da fala.

**Regra da vaquinha (vale para todas as páginas):**
- por padrão ela fica **no fundo da página**;
- se o fim da página tiver um elemento interessante (uma tabela, um card, um terminal),
  ela fica **logo acima dele, encostada**, como se o elemento fosse o chão.
  No código: o `<Cow />` vem imediatamente antes do elemento, sem espaço entre os dois;
- **cada página tem a sua fala.**

| Página | Fala |
|---|---|
| Login | `ssh voce@guacamole` |
| Cadastro | `git init minha-carreira` |
| Recuperar senha | `moo... esqueceu a senha?` |
| Início | `apt install conhecimento` |
| Cursos | `ls ./cursos --all` |
| Curso | `man curso` (não encontrado: `moo? curso nao existe`) |
| Aula | `./assistir --foco` (não encontrada: `moo? aula nao existe`) |
| Perfil | `whoami` |
| 404 | `moo? 404 not found` |

Nas páginas do app a vaca fica sobre a linha do rodapé (`AppLayout`). Nas telas de acesso, sobre a tabela de trilhas (`AuthLayout`).

Limite: o balão tem uma linha só. Mantenha a fala com até uns 40 caracteres.

### `Form.jsx`

| Export | O que é |
|---|---|
| `Field` | campo com rótulo, prompt `>`, mensagem de erro ou dica. Com `type="password"` ganha o botão **ver/ocultar** |
| `BTN`, `BTN_GHOST` | classes do botão principal (ciano com sombra rosa) e do secundário (contorno); servem para `<button>` e `<Link>` |
| `Submit` | botão principal brutalista (sombra rosa sólida); mostra "processando…" durante o envio |
| `Notice` | caixa de aviso com borda colorida (`tone`: cyan, pink ou orange) |
| `EMAIL_RE` | regra simples para validar e-mail |
| `fakeRequest` | finge uma chamada ao servidor (espera 0,9 s); só a recuperação de senha usa |

Acessibilidade do `Field`: o rótulo é ligado ao campo, o erro é anunciado por leitores de tela
(`aria-invalid`, `aria-describedby`, `role="alert"`) e a borda fica ciano quando o campo tem foco.

> ⚠️ `fakeRequest` é provisório: o `api_cursos.md` não tem rota de recuperação de senha. Quando o backend criar uma, ela entra no `api.js` e o `fakeRequest` sai.

### `api.js` — chamadas ao backend

Todas as chamadas ao servidor passam por aqui. As páginas nunca usam `fetch` direto.

**Como o usuário é identificado:** pelo **token** que o servidor devolve no login ou no cadastro.
Ele vai em toda requisição no cabeçalho `Authorization: Bearer <token>`.
O front **nunca envia `user_id`**, como manda o `api_cursos.md`. Assim ninguém consegue mexer nos dados de outra pessoa trocando um número na requisição.

**Onde o token fica guardado:**
- "Manter conectado" marcado → `localStorage` (continua depois de fechar o navegador);
- desmarcado, ou logo após o cadastro → `sessionStorage` (some ao fechar a aba).
- Se o servidor responder `401` numa rota autenticada, o token é apagado (expirou ou foi revogado).

**Funções disponíveis** (`import { api } from '../api'`):

| Função | Rota |
|---|---|
| `api.register(nome, email, senha)` | `POST /register` (guarda o token) |
| `api.login(email, senha, lembrar)` | `POST /login` (guarda o token) |
| `api.logout()` | `POST /logout` (apaga o token mesmo se falhar) |
| `api.me()` | `GET /me` |
| `api.watchlist()` | `GET /me/watchlist` |
| `api.courses(page)` | `GET /courses?page=N` |
| `api.course(id)` | `GET /courses/{id}` |
| `api.lessons(cursoId)` | `GET /courses/{id}/lessons` |
| `api.progress(cursoId)` | `GET /courses/{id}/progress` |
| `api.saveCourse(cursoId)` | `POST /courses/{id}/watchlist` |
| `api.unsaveCourse(cursoId)` | `DELETE /courses/{id}/watchlist` |
| `api.lesson(id)` | `GET /lessons/{id}` |
| `api.completeLesson(id)` | `POST /lessons/{id}/complete` |
| `api.uncompleteLesson(id)` | `DELETE /lessons/{id}/complete` |

**Erros:** toda falha vira um `ApiError` com `status` (código HTTP) e `data` (corpo da resposta).
`errorMessage(err)` transforma o erro numa frase em português para o usuário:

| Situação | Mensagem |
|---|---|
| servidor fora do ar (`status` 0) | "Não foi possível conectar ao servidor…" |
| `401` | "Sua sessão expirou. Entre de novo para continuar." |
| `404` | "Não encontrado." |
| `5xx` | "O servidor teve um problema…" |
| `422` (validação) | a mensagem que o servidor mandou |
| outros | "Algo deu errado (HTTP N)." |

Textos crus do servidor (às vezes em inglês, como "Unauthenticated.") só aparecem nos erros de validação.
Se a sessão expirar durante uma ação (salvar curso, concluir aula), o usuário vai para o login e depois volta para a mesma página.

> ⚠️ **Combinar com o backend** (o `api_cursos.md` não define):
> - o nome do campo do token na resposta: o front espera `{ "token": "..." }`;
> - o formato da paginação de `GET /courses`: o front aceita o padrão do Laravel (`{ data, current_page, last_page }`, também dentro de `meta`) ou uma lista simples;
> - respostas embrulhadas em `{ "data": ... }` (padrão dos API Resources do Laravel) são desembrulhadas automaticamente;
> - o campo `teacher` é tratado como texto (o nome do professor), como no exemplo do `api_cursos.md`;
> - o campo `course` de `GET /lessons/{id}` pode ser `{ id, title }` ou só o id;
> - o formato dos erros de validação: o front entende `{ "message": "...", "errors": { "email": ["..."] } }` (padrão do Laravel);
> - a liberação de CORS para o front.
>
> Se algum for diferente, a mudança é só no `api.js`.

## 7. Páginas

### Login (`/login`)

- Campos: e-mail e senha; link **"esqueci a senha"** ao lado do rótulo da senha.
- Checkbox "Manter conectado": decide onde o token fica guardado (ver `api.js`).
- Validação no navegador: e-mail válido e senha preenchida. Depois chama `POST /login`.
- Erros: `401` → "E-mail ou senha incorretos."; servidor fora do ar → aviso de conexão.
- Sucesso: guarda o token e vai para a página de onde o usuário veio (ou para o Perfil).

### Cadastro (`/cadastro`)

- Campos: nome, e-mail, senha, confirmar senha e aceite dos termos.
- **Medidor de força da senha** (função `strength`, nota de 0 a 4):
  - 0: menos de 8 caracteres;
  - +1 por cada item: letras maiúsculas e minúsculas juntas, número, símbolo.
- Validação no navegador: nome com 2+ letras, e-mail válido, força ≥ 2, senhas iguais, termos aceitos.
  Depois chama `POST /register` (envia `name`, `email`, `password`), guarda o token e vai para o catálogo.
- Erros do servidor por campo (ex.: e-mail já cadastrado) aparecem embaixo do campo certo; os outros, num aviso no topo.
- Os links de termos e privacidade ainda apontam para `#`.

### Recuperar senha (`/recuperar-senha`)

- Campo de e-mail.
- Depois do envio aparece a confirmação: "se existir uma conta com esse e-mail…".
  A frase não confirma se o e-mail existe, por segurança: assim ninguém descobre quais e-mails têm conta.
- Botão "Usar outro e-mail" volta ao formulário.

### Início (`/`)

- Chamada principal ("Aprenda tecnologia do zero") com botões **Explorar cursos** e **Criar conta grátis** (só deslogado).
- Caixa de terminal "como funciona" em 4 passos.
- **Continue de onde parou:** até 3 cursos salvos já começados e não finalizados (entre 1% e 99%; só logado, `GET /me/watchlist`).
- Os 6 primeiros cursos do catálogo (`GET /courses?page=1`).

### Cursos (`/cursos`)

- Grade de cards (3 colunas no desktop, 1 no celular) com paginação.
- A página atual fica na URL (`?page=2`): o botão voltar do navegador e links compartilhados funcionam.
- Mostra "nenhum curso importado ainda" quando a lista vem vazia, ou "essa página não existe" com link para a primeira, se a página pedida passar do fim.

### Curso (`/cursos/:id`)

- Título, professor, número de aulas e descrição.
- **Começar curso / Continuar:** abre a primeira aula ainda não concluída.
- **Salvar curso / ✓ Salvo:** liga e desliga a watchlist (`POST`/`DELETE /courses/{id}/watchlist`).
- Barra de progresso (logado, `GET /courses/{id}/progress`).
- Capa: miniatura do YouTube da primeira aula, em preto e branco com contraste alto (efeito fotocópia). Só no desktop.
- Lista de aulas em ordem, com ✓ nas concluídas (ou "nenhuma aula importada ainda").
- O botão Salvar mostra "salvando…" enquanto espera o servidor.

### Aula (`/aulas/:id`)

- Vídeo do YouTube (`youtube-nocookie.com`, versão que não grava cookies de rastreio antes do play).
- **Concluir e próxima** (marca e já abre a seguinte) e **Marcar como concluída / ✓ Concluída** (liga e desliga).
- Links anterior/próxima e lista lateral das aulas do curso, com a atual destacada e o total concluído (`1/5`).
- **Troca de aula instantânea:** ao ir para outra aula do mesmo curso, a tela usa os dados da lista lateral na hora,
  sem esperar o servidor (antes, com internet lenta, a aula anterior ficava na tela por segundos).
- Os botões só agem sobre a aula que está no endereço, nunca sobre outra.
- Ao concluir todas as aulas aparece **"Curso concluído!"** com link para escolher o próximo curso.

### Perfil (`/perfil`)

- "Olá, [primeiro nome]", e-mail e botão **Sair** (`POST /logout`; o token é apagado mesmo se o servidor falhar).
- Números: cursos salvos, aulas concluídas e cursos finalizados.
- **Meus cursos:** cards com a barra de progresso de cada curso salvo.
- Se o token tiver expirado, manda para o login.

### Página 404

- Qualquer endereço desconhecido mostra "Página perdida" com botão para o início.

## 8. Testes e revisão de interface

Os testes ficam em `frontend/tests/` e rodam com Playwright contra um **backend falso** que segue o `api_cursos.md`.
Para rodar, abra três terminais dentro de `frontend/`:

```bash
npm run dev          # terminal 1: o site
npm run mock-api     # terminal 2: backend falso em http://localhost:8000 (dados somem ao reiniciar)
npm run test:flow    # terminal 3: fluxo completo do usuário
npm run test:audit   # terminal 3: auditoria de interface e acessibilidade
```

Os prints ficam em `frontend/tests/shots/` (fora do git). Para simular internet lenta no backend falso: `MOCK_DELAY=1500 npm run mock-api`.

- **Fluxo completo (20 passos):** cadastro → catálogo → paginação → curso → salvar → aula → concluir e próxima →
  perfil com progresso → sair → senha errada → login → página além do fim do catálogo → curso concluído →
  sessão expirada volta ao login e depois à mesma página → curso inexistente → página 404. Sem erros inesperados.
- **Auditoria de interface:** todas as páginas, logado e deslogado, em 320, 390, 768, 1024 e 1440 px:
  - nenhuma página rola para o lado e nenhum elemento sai da tela, mesmo com um curso de título enorme;
  - verificação de acessibilidade com **axe-core** (contraste, rótulos, hierarquia de títulos, links): sem problemas.

## 9. Pendências

| Item | Depende de |
|---|---|
| Testar login e cadastro com o backend rodando | backend no ar + itens "combinar com o backend" do `api.js` |
| Recuperação de senha real | rota nova no backend (não existe no `api_cursos.md`) |
| Busca e filtro de cursos | rota de busca no backend (o `api_cursos.md` não tem) |
| Vaquinha no celular nas telas de acesso | decisão de design (hoje o painel com a vaca some no celular) |
| Trilhas reais no painel | importação via YouTube Data API v3 |
| Páginas de termos e privacidade | conteúdo |

## 10. Ferramentas de apoio

- **Playwright** e **axe-core**: dependências só de desenvolvimento (`devDependencies`), não vão para o site publicado.
  O navegador Chromium do Playwright fica no cache do sistema (`~/.cache/ms-playwright`).
- **Backend falso** (`tests/mock-api.mjs`): servidor Node em memória que imita o `api_cursos.md`, só para testar o front sem o backend real.

---

## Histórico

### 2026-11-09

- **Projeto criado:** Vite + React + Tailwind + React Router em `frontend/`.
- **Telas de acesso:** login, cadastro e recuperação de senha, com validação e envio simulado.
- **Layout dividido:** painel ASCII à esquerda e formulário à direita; uma coluna no celular.
- **Correções visuais (após prints):** logo maior e mais nítido, número de fundo sem quebra de linha, rótulo do medidor de senha mais curto.
- **Limpeza:** removidos os textos das pontas (`node://curso-em-video`, `sys.v0.1 // pt-br`, rodapé da API).
- **Cowsay:** o desenho do "olho" foi trocado pela vaca do cowsay; ligaduras da fonte desligadas para não quebrar a arte.
- **Cores pastel:** ciano `#00f0ff` → `#8ff0f4`, laranja `#ff6b1a` → `#ffb38a`, rosa `#ff2e88` → `#ff9cc6`.
- **Posições:** vaca entre o texto e a tabela; número da etapa no canto inferior esquerdo.
- **Fundo:** as linhas de scanline foram trocadas por um granulado de filme.
- **Texturas abstratas:** halftone, glitch e xerox foram testadas e **removidas**, porque não eram o efeito desejado. O próximo passo são imagens reais com filtro de fotocópia.
- **Favicon:** ícone de terminal (`public/favicon.svg`).
- **Documentação:** criado este `DOCS.md`.
- **Regra da vaquinha:** a vaca virou o componente `Cow.jsx`, fica em pé sobre a tabela de trilhas (antes flutuava no meio do painel, desalinhada) e ganhou uma fala diferente em cada página.
- **Códigos HTTP:** o número de fundo (01, 02, 03) foi trocado por códigos HTTP: 401 no login, 201 no cadastro, 404 na recuperação (prop `httpCode`).
- **Camada da API:** criado `src/api.js` com todas as rotas do `api_cursos.md`, token no cabeçalho `Authorization` e tratamento de erro. Login e cadastro agora chamam o backend de verdade; "Manter conectado" passou a funcionar. Recuperação de senha segue simulada (sem rota na API).
- **Fluxo completo do usuário:** novas páginas Início, Cursos, Curso, Aula, Perfil e 404, com `AppLayout` (menu + rodapé com a vaca), `ui.jsx` e `useApi.js`. Login leva de volta à página de origem; cadastro leva ao catálogo; `/perfil` exige login.
- **Revisão de interface:** página nova abre no topo; botões da aula travam enquanto ela carrega; anel de foco laranja para teclado; nome da página na aba; usuário logado não vê mais login/cadastro; títulos longos não estouram a grade (`wrap-anywhere`); menu cabe em 320px; título da Home menor em telas estreitas; links no meio do texto sempre sublinhados; hierarquia de títulos corrigida no catálogo.

### 2026-11-10

- **Testes dentro do projeto:** backend falso, teste de fluxo e auditoria foram para `frontend/tests/` (antes ficavam numa pasta temporária que era apagada a cada reinício). Novos comandos: `npm run mock-api`, `npm run test:flow`, `npm run test:audit`.
- **Revisão de UX:** cards compactos no celular; "Continue de onde parou" só com cursos começados; mensagens de erro sempre em português; sessão expirada leva ao login e volta à mesma página; aviso para página do catálogo que não existe e para curso sem aulas; "salvando…" no botão Salvar; mensagem "Curso concluído!"; troca de aula instantânea com internet lenta.
- **Vaquinha:** removida uma linha em branco acidental entre o balão e a vaca (`Cow.jsx` voltou à versão do commit).
- **Imagens de fundo descartadas:** a ideia de imagens (gatinhos, símbolos) com filtro de fotocópia foi abandonada; a pasta `frontend/arte/originais/` nunca chegou a ser criada e saiu das pendências.
