export interface PasswordCheck {
  id: "length" | "lower" | "upper" | "number" | "symbol";
  label: string;
  passed: boolean;
}

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrength {
  checks: PasswordCheck[];
  passedCount: number;
  /** 0-100, for the progress bar */
  percent: number;
  level: StrengthLevel;
  label: string;
  /** every rule satisfied — required to sign up */
  isStrong: boolean;
}

export const MIN_PASSWORD_LENGTH = 8;

export function getPasswordStrength(password: string): PasswordStrength {
  const checks: PasswordCheck[] = [
    { id: "length", label: `At least ${MIN_PASSWORD_LENGTH} characters`, passed: password.length >= MIN_PASSWORD_LENGTH },
    { id: "lower", label: "One lowercase letter (a-z)", passed: /[a-z]/.test(password) },
    { id: "upper", label: "One uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
    { id: "number", label: "One number (0-9)", passed: /\d/.test(password) },
    { id: "symbol", label: "One symbol (e.g. ! @ # $ %)", passed: /[^A-Za-z0-9\s]/.test(password) },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const percent = password ? Math.round((passedCount / checks.length) * 100) : 0;

  let level: StrengthLevel = "empty";
  let label = "";
  if (password) {
    if (passedCount <= 2) [level, label] = ["weak", "Weak"];
    else if (passedCount === 3) [level, label] = ["fair", "Fair"];
    else if (passedCount === 4) [level, label] = ["good", "Good"];
    else [level, label] = ["strong", "Strong"];
  }

  return { checks, passedCount, percent, level, label, isStrong: passedCount === checks.length };
}