import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isValidBrazilianMobile,
  isValidPin,
  toBrazilianE164,
} from '@/lib/phone';

export const runtime = 'nodejs';

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim() || null;
}

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Sessão não informada.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Somente o administrador pode redefinir PINs.' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      phone?: unknown;
      pin?: unknown;
    };

    const phone = typeof body.phone === 'string' ? body.phone : '';
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!isValidBrazilianMobile(phone)) {
      return NextResponse.json(
        { error: 'Informe um celular válido com DDD.' },
        { status: 400 }
      );
    }

    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: 'O novo PIN precisa ter exatamente 6 números.' },
        { status: 400 }
      );
    }

    const normalizedPhone = toBrazilianE164(phone);
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (targetError) {
      throw targetError;
    }

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Nenhuma conta foi encontrada com esse número.' },
        { status: 404 }
      );
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetProfile.id, {
        password: pin,
      });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Falha ao redefinir PIN:', error);

    return NextResponse.json(
      { error: 'Não foi possível redefinir o PIN.' },
      { status: 500 }
    );
  }
}
