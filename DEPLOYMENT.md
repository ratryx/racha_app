# Deploy na Vercel

## 1. Preparar o Supabase

No SQL Editor:

1. confirme que o schema inicial já foi executado;
2. execute todas as migrations em ordem;
3. execute `005_production_hardening.sql`;
4. confirme que a conta administrativa possui `role = 'admin'`.

No Auth:

- Phone provider habilitado;
- cadastro por telefone habilitado;
- confirmação telefônica desativada;
- senha mínima de 6 caracteres;
- sem exigência de letras ou símbolos.

## 2. Importar o projeto

Na Vercel:

1. escolha **Add New → Project**;
2. importe `ratryx/racha_app`;
3. mantenha o framework detectado como Next.js;
4. não altere o diretório raiz;
5. mantenha o comando de build como `npm run build`.

## 3. Variáveis de ambiente

Cadastre em Production, Preview e Development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

A variável `SUPABASE_SECRET_KEY`:

- não pode começar com `NEXT_PUBLIC_`;
- não deve aparecer no código do navegador;
- não deve ser enviada ao GitHub.

## 4. Fazer o deploy

Depois de salvar as variáveis, clique em **Deploy**.

Todo push na branch `main` criará um novo deploy.

## 5. Verificação após o deploy

Abra:

```text
https://SEU-DOMINIO.vercel.app/api/health
```

O resultado esperado é:

```json
{
  "status": "ok",
  "service": "racha-da-terca"
}
```

Depois valide:

- primeiro acesso e login;
- criação de apenas um card;
- edição do próprio card;
- bloqueio dos controles administrativos para usuário comum;
- lançamento de pós-jogo pelo administrador;
- perfil e histórico dos jogadores;
- layout em tela de aproximadamente 320 px;
- upload de JPG, PNG e WEBP;
- saída e novo login.

## 6. Antes do commit final

Remova os documentos temporários das tasks:

```bash
npm run cleanup:task-docs
```

Execute:

```bash
npm run check
```
