"use client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { COMMON_SKILLS } from "@/lib/common-skills";

export function SkillsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: string[];
  onChange: (data: string[]) => void;
}) {
  const [skills, setSkills] = useState<string[]>(defaultValues ?? []);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const query = input.trim().toLowerCase();
    return COMMON_SKILLS.filter(
      (skill) => skill.toLowerCase().includes(query) && !skills.includes(skill)
    ).slice(0, 6);
  }, [input, skills]);

  function commitSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      onChange(updated);
    }
    setInput("");
    setShowSuggestions(false);
  }

  function removeSkill(skill: string) {
    const updated = skills.filter((currentSkill) => currentSkill !== skill);
    setSkills(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">Skills</h2>

      <div className="relative">
        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitSkill(input);
            }
          }}
          onBlur={() => {
            commitSkill(input);
            setTimeout(() => setShowSuggestions(false), 100);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type a skill and press Enter (e.g. React, TypeScript)"
          className="w-full min-w-0 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 top-full mt-1 w-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  commitSkill(skill);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
        {skills.map((skill) => (
          <span
            key={skill}
            className="max-w-full flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm break-all"
          >
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}