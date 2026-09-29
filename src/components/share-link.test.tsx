import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ single: vi.fn(), updateEq: vi.fn(), update: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: mocks.single }) }),
      update: (values: unknown) => {
        mocks.update(values);
        return { eq: mocks.updateEq };
      },
    }),
  }),
}));

import { ShareLink } from "./share-link";
import { TooltipProvider } from "@/components/ui/tooltip";

async function openPanel() {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <ShareLink resumeId="resume-1" />
    </TooltipProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Share" }));
  const toggle = await screen.findByRole("switch", { name: "Public link" });
  return { user, toggle };
}

describe("ShareLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("disabling sharing clears is_public AND the share_id, so the old link cannot come back", async () => {
    mocks.single.mockResolvedValue({ data: { is_public: true, share_id: "abcdefgh1234" }, error: null });
    mocks.updateEq.mockResolvedValue({ error: null });

    const { user, toggle } = await openPanel();
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect((screen.getByLabelText("Public resume link") as HTMLInputElement).value).toContain("/r/abcdefgh1234");

    await user.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "false"));
    expect(mocks.update).toHaveBeenCalledWith({ is_public: false, share_id: null });
    expect(mocks.updateEq).toHaveBeenCalledWith("id", "resume-1");
    expect(screen.queryByLabelText("Public resume link")).not.toBeInTheDocument();
  });

  it("turning sharing back on creates a NEW link", async () => {
    mocks.single.mockResolvedValue({ data: { is_public: false, share_id: null }, error: null });
    mocks.updateEq.mockResolvedValue({ error: null });

    const { user, toggle } = await openPanel();
    await user.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
    const [values] = mocks.update.mock.calls[0] as [{ is_public: boolean; share_id: string }];
    expect(values.is_public).toBe(true);
    expect(values.share_id).toMatch(/^[A-Za-z0-9_-]{16,}$/);
  });

  it("keeps the link on and shows a friendly error if turning it off fails", async () => {
    mocks.single.mockResolvedValue({ data: { is_public: true, share_id: "abcdefgh1234" }, error: null });
    mocks.updateEq.mockResolvedValue({ error: { code: "57014", message: 'canceling statement: relation "resumes"' } });

    const { user, toggle } = await openPanel();
    await user.click(toggle);

    expect(await screen.findByText(/could not update sharing/i)).toBeInTheDocument();
    expect(screen.queryByText(/relation "resumes"/)).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
