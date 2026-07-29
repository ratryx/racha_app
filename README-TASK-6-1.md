# Task 6.1 — Supabase health check diário

O Vercel chama uma rota uma vez por dia. A rota executa uma consulta real e
somente leitura no Supabase.

## Variável obrigatória

Na Vercel, adicione em **Settings → Environment Variables**:

```text
CRON_SECRET=<valor aleatório com pelo menos 16 caracteres>
```

Para gerar um segredo com Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Adicione a variável ao ambiente **Production** e faça um novo deploy.

## Agendamento

```text
0 12 * * *
```

Executa uma vez por dia, aproximadamente às 12:00 UTC. No plano Hobby, a Vercel
pode executar em qualquer momento dentro dessa hora.

## Teste manual

Depois do deploy, envie o mesmo segredo no header:

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://SEU-DOMINIO.vercel.app/api/cron/supabase-health
```

Resultado esperado:

```json
{
  "ok": true,
  "database": "reachable"
}
```

O cron só funciona automaticamente em deployments de produção.
