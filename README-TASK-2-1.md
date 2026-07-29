# Task 2.1 — Login por telefone + PIN

Este pacote substitui o OTP por autenticação de telefone e senha do Supabase.
O usuário enxerga apenas um PIN numérico de 6 dígitos.

## 1. Copiar os arquivos

Extraia o ZIP na raiz do projeto e permita substituir os arquivos existentes.

## 2. Executar a migration

No Supabase SQL Editor, execute:

```text
supabase/migrations/003_phone_pin_auth.sql
```

## 3. Configurar Authentication

Em Authentication > Providers > Phone:

- mantenha Phone habilitado;
- desative a confirmação de telefone;
- não é necessário configurar Twilio ou outro provedor;
- permita novos cadastros.

Em Authentication > Password Security:

- mínimo de 6 caracteres;
- não exija letras ou símbolos, pois o acesso usa um PIN numérico.

## 4. Configurar a chave secreta

Em Project Settings > API Keys, copie a chave secreta do projeto.

Adicione ao `.env.local`:

```env
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxx
```

Nunca use o prefixo `NEXT_PUBLIC_` nessa chave e nunca envie o `.env.local` ao Git.

A chave é usada exclusivamente pela rota de servidor que permite ao administrador
redefinir o PIN de um jogador.

## 5. Primeiro acesso administrativo

Crie sua conta na aba "Primeiro acesso" usando o número administrativo.

Depois execute no SQL Editor:

```sql
update public.profiles
set role = 'admin',
    updated_at = now()
where phone = '+5512992277250';
```

Saia e entre novamente.

## 6. Testes

1. Crie a conta administrativa.
2. Confirme que aparecem "Pós-jogo" e "Redefinir PIN".
3. Abra uma janela anônima e crie uma conta comum.
4. Confirme que ela não vê os controles administrativos.
5. Redefina o PIN da conta comum pela conta administrativa.
6. Saia da conta comum e entre usando o novo PIN.

## 7. Build

```bash
npm run build
```
