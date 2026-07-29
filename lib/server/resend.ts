interface SendEmailInput {
  to: string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

interface ResendSuccessResponse {
  id?: string;
}

interface ResendErrorResponse {
  name?: string;
  message?: string;
}

function parseJsonSafely(
  value: string
): ResendSuccessResponse & ResendErrorResponse {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as ResendSuccessResponse &
      ResendErrorResponse;
  } catch {
    return {};
  }
}

export async function sendEmailWithResend(
  input: SendEmailInput
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Racha dos Amigos <onboarding@resend.dev>';

  if (!apiKey) {
    throw new Error('resend_api_key_missing');
  }

  const response = await fetch(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'racha-dos-amigos/1.0',
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      cache: 'no-store',
    }
  );

  const rawResponse = await response.text();
  const responseBody =
    parseJsonSafely(rawResponse);

  if (!response.ok) {
    console.error('Resend recusou o envio:', {
      status: response.status,
      name: responseBody.name,
      message: responseBody.message,
    });

    throw new Error(
      `resend_request_failed:${response.status}`
    );
  }

  if (!responseBody.id) {
    throw new Error('resend_response_without_id');
  }

  return responseBody.id;
}
