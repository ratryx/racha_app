# Task 5 — Perfil detalhado do jogador

## Alterações

- clicar ou tocar em qualquer card abre o perfil do jogador;
- modal responsivo em formato de bottom sheet no celular;
- fechamento por botão, clique externo, tecla `Esc` ou gesto para baixo;
- totais de partidas, gols, assistências, desarmes, defesas e craques;
- médias por partida;
- destaque principal conforme a posição;
- histórico das 12 partidas mais recentes;
- jogador com zero estatísticas ainda aparece no histórico;
- botão de edição aparece apenas para o dono do card;
- nenhuma migration nova é necessária.

## Arquivos

- `app/page.tsx`
- `components/modals/PlayerDetailsModal.tsx`
- `lib/supabase/queries.ts`
- `types/index.ts`

## Verificação

```bash
npm run build
npm run dev
```

Teste:

1. clique em cards diferentes;
2. abra o próprio card e confirme que aparece `Editar card`;
3. abra o card de outra pessoa e confirme que o botão não aparece;
4. teste `Esc`, clique externo e gesto para baixo no celular;
5. confira um jogador sem partidas e outro com histórico.
