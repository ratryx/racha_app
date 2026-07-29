# Task 7.2 — Corrigir visibilidade do background

O problema era a camada principal com fundo sólido cobrindo o background fixo.

## Correções

- `main` agora usa fundo transparente;
- novo contexto de empilhamento com `isolate`;
- background movido para `-z-10`;
- grid, luzes e partículas mais visíveis;
- partículas continuam muito abaixo da carga do background original;
- efeitos dos cards permanecem preservados.

## Teste

```bash
npm run check
npm run dev
```

Faça também um hard refresh no navegador:

```text
Ctrl + Shift + R
```
