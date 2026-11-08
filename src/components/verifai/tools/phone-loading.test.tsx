// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FreeTool } from "./FreeTool";

afterEach(cleanup);
it("validates a phone number after loading the deferred parser", async () => {
  render(<FreeTool slug="phone-verifier" />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "+1 202 555 0123" } });
  fireEvent.click(screen.getByRole("button", { name: "Validate number" }));
  const result = await screen.findByText(/2025550123/);
  expect(result.textContent).toContain('"valid": true');
  expect(result.textContent).toContain('"country": "US"');
});