import {
  createHash,
  timingSafeEqual,
} from 'node:crypto';
import { NextResponse } from 'next/server';

import { buildNewUserNotification } from '@/lib/email/newUserNotification';
import { sendEmailWithResend } from '@/lib/server/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const MAX_BODY_SIZE = 16 * 1024;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ProfileRecord {
  id: string;
  phone: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string | null;
}

interface InsertWebhookPayload {
  type: 'INSERT';
  table: 'profiles';
  schema: 'public';
  record: ProfileRecord;
  old_record: null;
}

function json(
  body: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function getBearerToken(
  request: Request
): string | null {
  const authorization =
    request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return (
    authorization
      .slice('Bearer '.length)
      .trim() || null
  );
}

function securelyMatches(
  actual: string,
  expected: string
): boolean {
  const actualHash = createHash('sha256')
    .update(actual)
    .digest();

  const expectedHash = createHash('sha256')
    .update(expected)
    .digest();

  return timingSafeEqual(
    actualHash,
    expectedHash
  );
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value)
  );
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === 'string'
    ? value
    : null;
}

function parsePayload(
  value: unknown
): InsertWebhookPayload | null {
  if (!isObject(value)) {
    return null;
  }

  if (
    value.type !== 'INSERT' ||
    value.table !== 'profiles' ||
    value.schema !== 'public' ||
    !isObject(value.record)
  ) {
    return null;
  }

  const record = value.record;

  if (
    typeof record.id !== 'string' ||
    !UUID_PATTERN.test(record.id)
  ) {
    return null;
  }

  return {
    type: 'INSERT',
    table: 'profiles',
    schema: 'public',
    record: {
      id: record.id,
      phone: readNullableString(
        record.phone
      ),
      display_name: readNullableString(
        record.display_name
      ),
      role: readNullableString(record.role),
      created_at: readNullableString(
        record.created_at
      ),
    },
    old_record: null,
  };
}

function getAdminUrl(): string {
  const explicitUrl =
    process.env.APP_URL?.trim();

  const vercelProductionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  const rawUrl =
    explicitUrl ||
    (vercelProductionUrl
      ? `https://${vercelProductionUrl}`
      : '');

  if (!rawUrl) {
    throw new Error('app_url_missing');
  }

  const url = new URL(rawUrl);

  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(
        url.hostname
      )
    )
  ) {
    throw new Error('app_url_invalid');
  }

  url.pathname = '/';
  url.search = '';
  url.hash = 'groups';

  return url.toString();
}

function getRecipients(): string[] {
  const recipients =
    process.env.NEW_USER_NOTIFICATION_EMAIL
      ?.split(',')
      .map((email) => email.trim())
      .filter(Boolean) ?? [];

  if (!recipients.length) {
    throw new Error(
      'notification_email_missing'
    );
  }

  return recipients;
}

export async function POST(request: Request) {
  try {
    const configuredSecret =
      process.env.SUPABASE_WEBHOOK_SECRET
        ?.trim();

    if (
      !configuredSecret ||
      configuredSecret.length < 32
    ) {
      console.error(
        'SUPABASE_WEBHOOK_SECRET ausente ou muito curto.'
      );

      return json(
        { error: 'Webhook não configurado.' },
        500
      );
    }

    const providedSecret =
      getBearerToken(request);

    if (
      !providedSecret ||
      !securelyMatches(
        providedSecret,
        configuredSecret
      )
    ) {
      return json(
        { error: 'Webhook não autorizado.' },
        401
      );
    }

    const contentType =
      request.headers.get('content-type') ??
      '';

    if (
      !contentType
        .toLowerCase()
        .includes('application/json')
    ) {
      return json(
        { error: 'Formato inválido.' },
        415
      );
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, 'utf8') >
      MAX_BODY_SIZE
    ) {
      return json(
        { error: 'Requisição muito grande.' },
        413
      );
    }

    let parsedBody: unknown;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return json(
        { error: 'JSON inválido.' },
        400
      );
    }

    const payload =
      parsePayload(parsedBody);

    if (!payload) {
      return json(
        {
          error:
            'Evento de webhook inválido.',
        },
        400
      );
    }

    if (payload.record.role === 'admin') {
      return json(
        {
          success: true,
          ignored: true,
          reason: 'admin_profile',
        },
        200
      );
    }

    const notification =
      buildNewUserNotification({
        userId: payload.record.id,
        displayName:
          payload.record.display_name,
        phone: payload.record.phone,
        createdAt:
          payload.record.created_at,
        adminUrl: getAdminUrl(),
      });

    const emailId =
      await sendEmailWithResend({
        to: getRecipients(),
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
        idempotencyKey:
          `new-profile-${payload.record.id}`,
      });

    return json(
      {
        success: true,
        emailId,
      },
      200
    );
  } catch (error) {
    console.error(
      'Falha ao notificar novo cadastro:',
      error instanceof Error
        ? error.message
        : error
    );

    return json(
      {
        error:
          'Não foi possível enviar a notificação.',
      },
      502
    );
  }
}
