"use client";
import { useState } from "react";
import { X } from "lucide-react";

export function SkillsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: string[];
  onChange: (data: string[]) => void;
}) {
  const [skills, setSkills] = useState<string[]>(defaultValues ?? []);
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      onChange(updated);
    }
    setInput("");
  }

  function removeSkill(skill: string) {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Skills</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
        onBlur={addSkill}
        placeholder="Type a skill and press Enter (e.g. React, TypeScript)"
        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
      />

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
          >
            {skill}
            <button onClick={() => removeSkill(skill)}>
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}