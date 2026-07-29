# Task 2 — Login por telefone e permissões

Arquivos deste pacote devem ser copiados para a raiz do projeto, preservando as pastas.

## Banco

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Execute `supabase/migrations/002_auth_and_permissions.sql`.
4. Em Authentication > Providers, habilite Phone e configure um provedor de SMS.
5. Entre uma vez no aplicativo com o telefone administrativo.
6. No SQL Editor, execute sem salvar o número no Git:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where phone = '+5512992277250';
```

## Comportamento

- Login sem senha por código SMS.
- Validação brasileira: DDD + celular de 9 dígitos.
- Um card por conta.
- Usuário comum cria o próprio card uma vez.
- Depois da criação, pode editar apenas nome, nome no card e foto.
- Apenas `admin` pode lançar pós-jogo.
- Permissões são verificadas pelo banco, não somente pela interface.
- Imagens têm limite de 5 MB e ficam em uma pasta por usuário.

## Verificação

```bash
npm run build
```
