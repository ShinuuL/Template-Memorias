# 🌹 Site de Memórias

Um cantinho pessoal para guardar **cartas, fotos e músicas**. Feito com
[Next.js](https://nextjs.org) (App Router), [Supabase](https://supabase.com)
(auth + Postgres + Storage) e Tailwind CSS.

- **Visualizador**: acerta uma "senha" na fachada e navega pelas memórias
  (carta → fotos → músicas do Spotify).
- **Administrador**: faz login e cria/edita memórias, envia fotos da galeria,
  monta a playlist e define o visual (cores e fontes) de cada memória.

---

## Como funciona

| Papel | O que faz |
|-------|-----------|
| **Visualizador** | Vê a fachada (`/`), acerta a resposta configurada e acessa `/memorias`. Não precisa criar conta. |
| **Admin** | Faz login em `/login` (e-mail + senha) e gerencia tudo em `/admin`. |

Cada **memória** tem:

- Um título e uma data
- Uma **carta** (texto livre)
- Um **álbum de fotos** (upload da galeria, reordenáveis, com legenda)
- Uma **playlist** de músicas do Spotify (players limpos, sem barra de rolagem)
- Um **tema próprio** (cor de fundo, cor do texto, destaque, fonte do título e do corpo)

---

## Pré-requisitos

- Node.js 20.9+ e npm
- Uma conta gratuita no [Supabase](https://supabase.com)

---

## 1. Configuração do Supabase

1. Crie um novo projeto no Supabase.
2. Abra o **SQL Editor** e cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   Isso cria as tabelas, as políticas de segurança (RLS), o trigger de papel
   (admin/viewer) e o bucket de fotos.
3. Crie o usuário administrador:
   - Aba **Authentication → Users → Add user**, crie o e-mail/senha do admin.
   - Copie o **UUID** do usuário criado.
   - No SQL Editor, promova para admin:
     ```sql
     update public.profiles set role = 'admin'
     where id = '<UUID do usuário>';
     ```
4. (Opcional) Para dados de exemplo, rode [`supabase/seed.sql`](supabase/seed.sql).

## 2. Variáveis de ambiente

Copie e preencha:

```bash
cp .env.local.example .env.local
```

As chaves ficam em **Project Settings → API** (ou **Data API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

> ⚠️ O bucket e a tabela de fotos usam a `anon key` pública com **RLS** que
> bloqueia escrita para quem não é admin — por isso não expor a `service_role key`.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O admin entra em `/login`, e o visualizador em `/`.

---

## Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. No [Vercel](https://vercel.com), importe o repositório (o framework Next.js
   é detectado automaticamente).
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) em **Settings → Environment Variables**.
4. Faça o deploy. Pronto — fica acessível de qualquer dispositivo.

> Dica: em **Production**, garanta que as mesmas duas variáveis estejam
> definidas para o ambiente de produção.

---

## Estrutura

```
supabase/
  schema.sql   # tabelas + RLS + trigger + bucket
  seed.sql     # dados de exemplo (opcional)
src/
  app/
    page.tsx               # fachada (pergunta → libera acesso)
    login/page.tsx         # login do admin
    memorias/page.tsx      # lista pública de memórias
    memorias/[id]/page.tsx # uma memória (carta + fotos + músicas)
    admin/...              # painel administrativo
    proxy.ts               # proteção de rotas (admin / visualizador)
  components/
    admin/                 # painel (editor, lista, config da fachada)
    memorias/              # visualização (memory-view, spotify)
    fachada/               # formulário da fachada
  lib/
    supabase/              # client/server/middleware do Supabase
    actions/               # server actions (auth, memórias, fotos, config)
    data.ts                # leitura dos dados
    types.ts / theme.ts    # tipos e manipulação de tema
```

---

## Segurança

- O **admin** é protegido por dois níveis: o `proxy.ts` (redireciona) e uma
  verificação de papel no `layout.tsx` do `/admin` (camada extra no servidor).
- As políticas **RLS** do Supabase garantem que **somente admin** consegue
  escrever (criar/editar/apagar memórias e enviar/apagar fotos); leitura
  pública apenas para o visualizador já liberado.
- O **visualizador** não cria conta: o acesso é liberado por um cookie
  (`memorias_unlocked`) definido somente quando acerta a resposta da fachada.
