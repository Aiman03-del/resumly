import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children and responds to clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save resume</Button>);

    const button = screen.getByRole("button", { name: "Save resume" });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save resume
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save resume" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});