# Task 7.3 — Correção definitiva da camada do background

A correção anterior colocou o background em `-z-10` dentro de um
stacking context criado por `isolate`. Isso fez o background ficar atrás
da própria página e do fundo do `body`.

## Correção

- remove `isolate` do `<main>`;
- mantém o `<main>` transparente;
- coloca o background em `z-0`;
- mantém header e conteúdo em `z-20` e `z-10`;
- modais continuam acima de tudo.

## Teste

```bash
npm run check
npm run dev
```

Depois faça:

```text
Ctrl + Shift + R
```
