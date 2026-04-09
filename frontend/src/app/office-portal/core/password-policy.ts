/** Matches server: 8–16 chars, first character A–Z. */
export const PASSWORD_POLICY_HINT =
  'Password must be 8–16 characters and start with a capital letter (A–Z).';

export function isPasswordPolicyValid(password: string): boolean {
  if (!password || password.length < 8 || password.length > 16) {
    return false;
  }
  const c = password.charAt(0);
  return c >= 'A' && c <= 'Z';
}

/** Email must contain ".com", or value is a mobile (10 digits, or longer with last 10 digits). */
export function isForgotIdentifierValid(raw: string): boolean {
  const t = raw.trim();
  if (!t) {
    return false;
  }
  if (t.toLowerCase().includes('.com')) {
    return true;
  }
  const digits = t.replace(/\D/g, '');
  if (digits.length === 0) {
    return false;
  }
  const core = digits.length > 10 ? digits.slice(-10) : digits;
  return core.length === 10;
}

export function forgotIdentifierError(raw: string): string {
  if (!raw.trim()) {
    return 'Enter your email or 10-digit mobile number.';
  }
  if (!isForgotIdentifierValid(raw)) {
    return 'Use a 10-digit mobile number, or an email containing .com.';
  }
  return '';
}

/** Office user reset (admin API): any non-empty username, mobile, or email. */
export function officeAccountIdentifierError(raw: string): string {
  if (!raw?.trim()) {
    return 'Enter your office username, mobile number, or email.';
  }
  return '';
}
