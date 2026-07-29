# Racha da Terça — Dashboard de Overall

Scaffold funcional do dashboard estilo FUT pro racha semanal.

## Estrutura

```
app/
  layout.tsx          → layout raiz
  page.tsx             → dashboard principal (junta tudo)
  globals.css
components/
  cards/
    PlayerCard.tsx      → card estilo FUT com tilt 3D (Framer Motion)
    RankBadge.tsx        → badge de destaque (craque do jogo)
  dashboard/
    StadiumBackground.tsx → fundo em Three.js (partículas)
    CardGrid.tsx          → grid de cards com stagger animation
    Leaderboard.tsx        → artilheiro/garçom/maior ovr
  modals/
    CreatePlayerModal.tsx → criação de card (nome, foto, posição)
    PostMatchModal.tsx    → lançamento do pós-jogo
lib/
  calculateOverall.ts   → fórmula do overall/atributos por posição
  supabase/
    client.ts
    queries.ts
types/
  index.ts
supabase/
  schema.sql             → schema completo do banco
```

## Decisões técnicas (por quê)

- **Card em HTML/CSS + Framer Motion, não Three.js puro.** Renderizar texto
  e foto dentro de uma cena WebGL é mais caro e difícil de manter que um
  card em CSS com `perspective`/`rotateX`/`rotateY`. O Three.js entra no
  `StadiumBackground`, onde ele compensa (ambientação, sem competir com
  legibilidade do card).
- **Overall calculado, não digitado.** Vem de `calculateOverall.ts`, que
  pondera gols/assistências/desarmes/defesas de forma diferente por posição
  (igual o FIFA faz: um zagueiro ganha OVR desarmando, não fazendo gol).
  Os pesos em `refs` e `pesos` são só um ponto de partida — ajusta ao gosto
  do grupo depois de umas rodadas de dados reais.
- **Toda a leitura de dados passa por `lib/supabase/queries.ts`.** Nenhum
  componente fala direto com o Supabase — facilita trocar de banco ou
  mockar em teste.

## Setup

1. Criar projeto no Supabase, rodar `supabase/schema.sql` no SQL Editor.
2. Criar bucket público `player-photos` no Storage.
3. `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. `npm install && npm run dev`

## Próximos passos sugeridos

- Auth simples (Supabase Auth) só pra galera do grupo poder editar
- Página de histórico/evolução do OVR por jogador (gráfico de linha)
- Card especial (dourado) temporário quando o jogador bomba numa rodada
- Comparação lado a lado entre 2 jogadores
- Export do card como imagem (pra mandar no grupo do zap)
