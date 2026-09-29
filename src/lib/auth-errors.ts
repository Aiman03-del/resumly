export type AuthErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

export const GENERIC_LOGIN_ERROR = "We couldn't log you in right now. Please try again in a moment.";
const RATE_LIMITED = "Too many attempts. Please wait a few minutes and try again.";
const BAD_CREDENTIALS = "Incorrect email or password. Please try again.";
const NOT_CONFIRMED = "Please confirm your email before logging in. Check your inbox.";

/** Turns a Supabase auth error into text that is safe to show to a user. Never returns error.message as-is. */
export function friendlyLoginError(error: AuthErrorLike): string {
  switch (error?.code) {
    case "invalid_credentials":
      return BAD_CREDENTIALS;
    case "email_not_confirmed":
      return NOT_CONFIRMED;
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return RATE_LIMITED;
    case "user_banned":
      return "This account is unavailable. Please contact support.";
  }
  if (error?.status === 429) return RATE_LIMITED;

  const message = error?.message ?? "";
  if (/invalid login credentials/i.test(message)) return BAD_CREDENTIALS;
  if (/email not confirmed/i.test(message)) return NOT_CONFIRMED;

  return GENERIC_LOGIN_ERROR;
}
