const BRAZIL_COUNTRY_CODE = '55';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeBrazilianPhone(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length === 13 && digits.startsWith(BRAZIL_COUNTRY_CODE)) {
    return digits.slice(2);
  }

  return digits.slice(0, 11);
}

export function isValidBrazilianMobile(value: string): boolean {
  const digits = normalizeBrazilianPhone(value);

  // DDD com dois dígitos + celular com 9 dígitos iniciado por 9.
  return /^[1-9]{2}9\d{8}$/.test(digits);
}

export function toBrazilianE164(value: string): string {
  const digits = normalizeBrazilianPhone(value);

  if (!isValidBrazilianMobile(digits)) {
    throw new Error('Informe um celular válido com DDD.');
  }

  return `+${BRAZIL_COUNTRY_CODE}${digits}`;
}

export function formatBrazilianPhone(value: string): string {
  const digits = normalizeBrazilianPhone(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPin(value: string): boolean {
  return /^\d{6}$/.test(value);
}
