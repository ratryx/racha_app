# Notificação de novo cadastro

O sistema envia um e-mail para o administrador quando uma linha é criada em
`public.profiles`.

## Destinatário

```text
thiagobettin21@gmail.com
```

O endereço é configurado por variável de ambiente e não fica exposto no
frontend.

## 1. Criar a conta no Resend

Crie a conta do Resend usando `thiagobettin21@gmail.com` para conseguir testar
com o domínio padrão `resend.dev`.

Depois, crie uma API Key com permissão de envio.

## 2. Variáveis no Vercel

Adicione em **Project > Settings > Environment Variables**, no ambiente
**Production**:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Racha dos Amigos <onboarding@resend.dev>
NEW_USER_NOTIFICATION_EMAIL=thiagobettin21@gmail.com
SUPABASE_WEBHOOK_SECRET=COLOQUE_UM_SEGREDO_ALEATORIO_DE_64_CARACTERES
APP_URL=https://SEU-PROJETO.vercel.app
```

Gere o segredo com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Após salvar as variáveis, faça um novo deploy.

## 3. Criar o Database Webhook no Supabase

No painel do Supabase:

1. Abra **Database > Webhooks**.
2. Clique em **Create a new webhook**.
3. Nome: `notify-new-user`.
4. Tabela: `public.profiles`.
5. Evento: somente `INSERT`.
6. Método: `POST`.
7. URL:

```text
https://SEU-PROJETO.vercel.app/api/webhooks/new-user
```

8. Headers:

```text
Content-Type: application/json
Authorization: Bearer O_MESMO_SUPABASE_WEBHOOK_SECRET
```

## 4. Testar

Crie uma conta nova pelo site.

Resultado esperado:

- a conta aparece como **Sem grupo**;
- o contador de pendências aumenta no botão **Gerenciar grupos**;
- o e-mail chega em `thiagobettin21@gmail.com`;
- o botão do e-mail abre o site com o painel de grupos.

## Teste manual do endpoint

Com o projeto rodando localmente:

```bash
curl -X POST http://localhost:3000/api/webhooks/new-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_SEGREDO" \
  -d '{
    "type": "INSERT",
    "table": "profiles",
    "schema": "public",
    "record": {
      "id": "11111111-1111-4111-8111-111111111111",
      "phone": "5512999999999",
      "display_name": "Teste de cadastro",
      "role": "user",
      "created_at": "2026-07-29T18:00:00.000Z"
    },
    "old_record": null
  }'
```

O teste envia um e-mail real. A chave de idempotência evita duplicações do
mesmo ID por 24 horas.
