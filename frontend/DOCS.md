# Guacamole — Documentação do Front-end

Registro vivo do front-end: o que existe, como funciona e por que foi feito assim.
Atualizado a cada mudança. A seção **Histórico** no fim lista tudo em ordem.

---

## 1. Visão geral

Guacamole reúne em um só lugar o conteúdo do canal **Curso em Vídeo** (YouTube),
apresentado como cursos. Público: jovens entrando agora na área de tecnologia.

Escopo atual: **login, cadastro e recuperação de senha**. Ainda **sem backend**:
os formulários validam no navegador e simulam o envio.

Regra do projeto: o trabalho de front-end fica só na pasta `frontend/`. A pasta `backend/` não é tocada.

## 2. Como rodar

```bash
cd frontend
npm install        # só na primeira vez
npm run dev        # servidor local em http://localhost:5173
npm run build      # gera a versão final em frontend/dist
```

Rotas:

| Rota | Página |
|---|---|
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/recuperar-senha` | Recuperação de senha |
| qualquer outra | redireciona para `/login` |

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
    ├── index.css           tema (cores, fontes) e efeitos globais
    ├── components/
    │   ├── AuthLayout.jsx  layout dividido das telas de acesso
    │   ├── Cow.jsx         vaca do cowsay com fala configurável
    │   └── Form.jsx        campo, botão, aviso e utilitários
    └── pages/
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
| `pre` sem ligaduras | a fonte JetBrains Mono junta caracteres como `\|\|--`, o que quebrava a arte ASCII; isso foi desligado nos blocos `<pre>` |

Quem ativa "reduzir movimento" no sistema não vê as animações.

## 6. Componentes

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

Limite: o balão tem uma linha só. Mantenha a fala com até uns 40 caracteres.

### `Form.jsx`

| Export | O que é |
|---|---|
| `Field` | campo com rótulo, prompt `>`, mensagem de erro ou dica. Com `type="password"` ganha o botão **ver/ocultar** |
| `Submit` | botão principal brutalista (sombra rosa sólida); mostra "processando…" durante o envio |
| `Notice` | caixa de aviso com borda colorida (`tone`: cyan, pink ou orange) |
| `EMAIL_RE` | regra simples para validar e-mail |
| `fakeRequest` | finge uma chamada ao servidor (espera 0,9 s) |

Acessibilidade do `Field`: o rótulo é ligado ao campo, o erro é anunciado por leitores de tela
(`aria-invalid`, `aria-describedby`, `role="alert"`) e a borda fica ciano quando o campo tem foco.

> ⚠️ `fakeRequest` é provisório. Quando a API de autenticação existir, ele vira uma chamada `fetch` de verdade.

## 7. Páginas

### Login (`/login`)

- Campos: e-mail e senha; link **"esqueci a senha"** ao lado do rótulo da senha.
- Checkbox "Manter conectado" (ainda sem efeito, depende do backend).
- Validação: e-mail válido e senha preenchida.
- Sucesso: mostra um aviso (ainda não entra de verdade).

### Cadastro (`/cadastro`)

- Campos: nome, e-mail, senha, confirmar senha e aceite dos termos.
- **Medidor de força da senha** (função `strength`, nota de 0 a 4):
  - 0: menos de 8 caracteres;
  - +1 por cada item: letras maiúsculas e minúsculas juntas, número, símbolo.
- Validação: nome com 2+ letras, e-mail válido, força ≥ 2, senhas iguais, termos aceitos.
- Os links de termos e privacidade ainda apontam para `#`.

### Recuperar senha (`/recuperar-senha`)

- Campo de e-mail.
- Depois do envio aparece a confirmação: "se existir uma conta com esse e-mail…".
  A frase não confirma se o e-mail existe, por segurança: assim ninguém descobre quais e-mails têm conta.
- Botão "Usar outro e-mail" volta ao formulário.

## 8. Pendências

| Item | Depende de |
|---|---|
| Login, cadastro e recuperação reais | API de autenticação no backend |
| "Manter conectado" funcionando | backend (sessão/token) |
| Trilhas reais no painel | importação via YouTube Data API v3 |
| Páginas de termos e privacidade | conteúdo |
| Imagens com efeito de fotocópia (gatinhos, símbolos) | imagens enviadas em `frontend/arte/originais/` |

## 9. Ferramentas de apoio (fora do projeto)

- **Playwright + Chromium**: instalados fora do repositório, só para tirar prints e conferir o visual.
  Não fazem parte do `package.json`.

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
