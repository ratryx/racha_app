# Racha da Terça

Aplicação privada para gerenciar os cards e as estatísticas do grupo.

## Funcionalidades

- login por telefone e PIN;
- uma conta e um card por jogador;
- edição de nome, posição e foto;
- cards animados com raridades e overall calculado;
- lançamento de pós-jogo exclusivo para administrador;
- artilheiro, garçom, craque e ranking de overall;
- perfil detalhado com médias e histórico recente;
- experiência responsiva para desktop e celular.

## Stack

- Next.js 14;
- TypeScript;
- Tailwind CSS;
- Framer Motion;
- React Three Fiber;
- Supabase Auth, Database e Storage;
- Vercel.

## Desenvolvimento local

Copie o exemplo de ambiente:

```bash
cp .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
```

Instale e execute:

```bash
npm install
npm run dev
```

## Banco de dados

Em um projeto novo:

1. execute `supabase/schema.sql`;
2. execute os arquivos de `supabase/migrations/` em ordem numérica;
3. configure o Auth para telefone + senha;
4. mantenha a chave secreta somente no servidor.

## Validação

```bash
npm run check
```

Esse comando executa lint, TypeScript e build de produção.

## Deploy

Consulte [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Segurança

Consulte [`SECURITY.md`](./SECURITY.md).
