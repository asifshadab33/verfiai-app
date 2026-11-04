// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolSignInPrompt } from "./ToolSignInPrompt";

describe("ToolSignInPrompt", () => {
  it("directs visitors to sign in before submitting tool input", () => {
    render(<ToolSignInPrompt tool="the DOI checker" />);
    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeTruthy();
    expect(screen.getByText(/^Sign in to continue to the DOI checker\./)).toBeTruthy();
    expect(screen.getByText(/your input is not submitted until you sign in/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/auth");
  });
});
