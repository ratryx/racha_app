import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isValidBrazilianMobile,
  isValidPin,
  toBrazilianE164,
} from '@/lib/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const MAX_BODY_SIZE = 2048;

function json(
  body: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim() || null;
}

function isAllowedBrowserRequest(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');

  return (
    !fetchSite ||
    fetchSite === 'same-origin' ||
    fetchSite === 'same-site'
  );
}

export async function POST(request: Request) {
  try {
    if (!isAllowedBrowserRequest(request)) {
      return json({ error: 'Origem da requisição não permitida.' }, 403);
    }

    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().includes('application/json')) {
      return json({ error: 'Formato da requisição inválido.' }, 415);
    }

    const contentLength = Number(
      request.headers.get('content-length') ?? '0'
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_SIZE
    ) {
      return json({ error: 'Requisição muito grande.' }, 413);
    }

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return json({ error: 'Sessão não informada.' }, 401);
    }

    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return json({ error: 'Sessão inválida ou expirada.' }, 401);
    }

    const { data: adminProfile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || adminProfile?.role !== 'admin') {
      return json(
        { error: 'Somente o administrador pode redefinir PINs.' },
        403
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return json({ error: 'JSON inválido.' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'Dados da requisição inválidos.' }, 400);
    }

    const payload = body as Record<string, unknown>;
    const phone =
      typeof payload.phone === 'string' ? payload.phone : '';
    const pin = typeof payload.pin === 'string' ? payload.pin : '';

    if (!isValidBrazilianMobile(phone)) {
      return json(
        { error: 'Informe um celular válido com DDD.' },
        400
      );
    }

    if (!isValidPin(pin)) {
      return json(
        { error: 'O novo PIN precisa ter exatamente 6 números.' },
        400
      );
    }

    const normalizedPhone = toBrazilianE164(phone);

    const { data: targetProfile, error: targetError } =
      await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

    if (targetError) {
      throw targetError;
    }

    if (!targetProfile) {
      return json(
        { error: 'Nenhuma conta foi encontrada com esse número.' },
        404
      );
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(
        targetProfile.id,
        {
          password: pin,
        }
      );

    if (updateError) {
      throw updateError;
    }

    return json({ success: true }, 200);
  } catch (error) {
    console.error('Falha ao redefinir PIN:', error);

    return json(
      { error: 'Não foi possível redefinir o PIN.' },
      500
    );
  }
}
