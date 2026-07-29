# Segurança

## Modelo atual

- usuários entram com telefone e PIN;
- o Supabase armazena a credencial de autenticação;
- permissões sensíveis são verificadas no banco;
- apenas contas com `role = 'admin'` podem lançar pós-jogo;
- cada usuário pode criar somente um card;
- cada usuário pode alterar somente o próprio card;
- a chave secreta do Supabase é usada apenas em rota de servidor;
- o aplicativo solicita que mecanismos de busca não indexem as páginas.

## Pontos importantes

### PIN

Um PIN de seis dígitos é adequado somente para este aplicativo privado e
informal. Os jogadores não devem reutilizar PIN de banco, celular ou outras
contas importantes.

### Fotos

O bucket atual de fotos é público para permitir que os cards carreguem as
imagens diretamente. Não use fotos que devam permanecer privadas.

### Chaves

Nunca envie ao Git:

- `.env.local`;
- `SUPABASE_SECRET_KEY`;
- Personal Access Token do Supabase;
- tokens de sessão;
- arquivos exportados com credenciais.

### Administrador

A interface não é a proteção principal. As funções administrativas precisam
continuar verificando `role = 'admin'` no servidor ou no PostgreSQL.

## Resposta a incidente

Caso uma chave secreta seja exposta:

1. revogue ou rotacione a chave no Supabase;
2. atualize a variável na Vercel;
3. gere um novo deploy;
4. remova a chave do histórico do Git, caso ela tenha sido commitada;
5. revise usuários, partidas e alterações recentes.
