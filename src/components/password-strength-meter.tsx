"use client";

import { Check, Circle } from "lucide-react";
import { getPasswordStrength, type StrengthLevel } from "@/lib/password-strength";

const BAR_COLOR: Record<StrengthLevel, string> = {
  empty: "bg-transparent",
  weak: "bg-red-500",
  fair: "bg-orange-500",
  good: "bg-yellow-500",
  strong: "bg-green-500",
};

const TEXT_COLOR: Record<StrengthLevel, string> = {
  empty: "text-foreground/50",
  weak: "text-red-600",
  fair: "text-orange-600",
  good: "text-yellow-600",
  strong: "text-green-600",
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Password strength"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength.percent}
          className="h-1.5 flex-1 rounded-full bg-neutral-200 overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${BAR_COLOR[strength.level]}`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
        <span aria-live="polite" className={`text-xs font-medium w-12 text-right ${TEXT_COLOR[strength.level]}`}>
          {strength.label || "\u00A0"}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-1">
        {strength.checks.map((check) => (
          <li
            key={check.id}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              check.passed ? "text-green-600" : "text-foreground/50"
            }`}
          >
            {check.passed ? <Check size={13} /> : <Circle size={13} />}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}