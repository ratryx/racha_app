interface NewUserNotificationInput {
  userId: string;
  displayName: string | null;
  phone: string | null;
  createdAt: string | null;
  adminUrl: string;
}

export interface NewUserNotification {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatPhone(phone: string | null): string {
  if (!phone) {
    return 'Não informado';
  }

  const digits = phone.replace(/\D/g, '');
  const brazilianDigits =
    digits.startsWith('55') && digits.length >= 12
      ? digits.slice(2)
      : digits;

  if (brazilianDigits.length === 11) {
    return `+55 (${brazilianDigits.slice(0, 2)}) ${brazilianDigits.slice(
      2,
      7
    )}-${brazilianDigits.slice(7)}`;
  }

  if (brazilianDigits.length === 10) {
    return `+55 (${brazilianDigits.slice(0, 2)}) ${brazilianDigits.slice(
      2,
      6
    )}-${brazilianDigits.slice(6)}`;
  }

  return phone;
}

function formatCreatedAt(createdAt: string | null): string {
  if (!createdAt) {
    return 'Agora';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

export function buildNewUserNotification(
  input: NewUserNotificationInput
): NewUserNotification {
  const displayName =
    input.displayName?.trim() || 'Novo jogador';
  const phone = formatPhone(input.phone);
  const createdAt = formatCreatedAt(input.createdAt);

  const safeName = escapeHtml(displayName);
  const safePhone = escapeHtml(phone);
  const safeCreatedAt = escapeHtml(createdAt);
  const safeUserId = escapeHtml(input.userId);
  const safeAdminUrl = escapeHtml(input.adminUrl);

  return {
    subject: `Novo cadastro aguardando grupo — ${displayName}`,
    text: [
      'Racha dos Amigos',
      '',
      'Uma nova conta foi criada e está aguardando grupo.',
      '',
      `Nome: ${displayName}`,
      `Telefone: ${phone}`,
      `Cadastro: ${createdAt}`,
      `ID: ${input.userId}`,
      '',
      `Abrir painel administrativo: ${input.adminUrl}`,
    ].join('\n'),
    html: `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Novo cadastro</title>
        </head>
        <body style="margin:0;background:#050705;color:#ffffff;font-family:Inter,Arial,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050705;padding:28px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(255,255,255,.10);border-radius:24px;background:#0a0e0b;overflow:hidden;">
                  <tr>
                    <td style="padding:30px;background:linear-gradient(135deg,rgba(163,230,53,.13),rgba(34,211,238,.05));border-bottom:1px solid rgba(255,255,255,.08);">
                      <p style="margin:0 0 10px;color:#a3e635;font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;">
                        Racha dos Amigos
                      </p>
                      <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.12;">
                        Novo cadastro aguardando grupo
                      </h1>
                      <p style="margin:12px 0 0;color:#8b938d;font-size:14px;line-height:1.6;">
                        Uma nova conta entrou no sistema e precisa ser atribuída a um grupo.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:26px 30px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:0 0 14px;color:#6f7771;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">
                            Jogador
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px;border:1px solid rgba(163,230,53,.18);border-radius:16px;background:rgba(163,230,53,.055);">
                            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:800;">${safeName}</p>
                            <p style="margin:8px 0 0;color:#a7afa9;font-size:14px;">${safePhone}</p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                        <tr>
                          <td style="width:50%;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);">
                            <p style="margin:0;color:#69716b;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Cadastro</p>
                            <p style="margin:6px 0 0;color:#ffffff;font-size:13px;font-weight:700;">${safeCreatedAt}</p>
                          </td>
                          <td style="width:12px;"></td>
                          <td style="width:50%;padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);">
                            <p style="margin:0;color:#69716b;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Status</p>
                            <p style="margin:6px 0 0;color:#facc15;font-size:13px;font-weight:800;">Sem grupo</p>
                          </td>
                        </tr>
                      </table>

                      <div style="padding-top:24px;text-align:center;">
                        <a href="${safeAdminUrl}" style="display:inline-block;padding:14px 22px;border-radius:14px;background:#a3e635;color:#081008;text-decoration:none;font-size:14px;font-weight:900;">
                          Abrir painel de grupos
                        </a>
                      </div>

                      <p style="margin:22px 0 0;color:#58605a;font-size:10px;line-height:1.5;text-align:center;">
                        ID da conta: ${safeUserId}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}
