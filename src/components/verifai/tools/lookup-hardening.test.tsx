// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArxivFinder from "./ArxivFinder";
import { FreeTool } from "./FreeTool";

beforeEach(() => sessionStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("browser lookup hardening", () => {
  it("caches arXiv results across normalized queries", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      '<feed><entry><title>Example paper</title><id>https://arxiv.org/abs/123</id><summary>Summary</summary></entry></feed>',
    ));
    render(<ArxivFinder />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: " Physics " } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByRole("link", { name: /Example paper/ });
    expect(JSON.parse(sessionStorage.getItem("arxiv:physics") ?? "null")).toHaveLength(1);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "physics" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByRole("link", { name: /Example paper/ });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([429, 503])("shows the arXiv busy error (%s)", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status }));
    render(<ArxivFinder />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "physics" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByText("The arXiv query service is temporarily busy. Please try again shortly.");
    expect(sessionStorage.getItem("arxiv:physics")).toBeNull();
  });

  it("reuses DNS results but separates record types", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({ Status: 0 }));
    render(<FreeTool slug="dns-inspector" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: " Example.COM " } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(sessionStorage.getItem("dns:A:example.com")).toBe('{"Status":0}'));
    await waitFor(() => expect(screen.getByRole("button", { name: "Search" }).hasAttribute("disabled")).toBe(false));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Search" }).hasAttribute("disabled")).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "MX" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(sessionStorage.getItem("dns:MX:example.com")).toBe('{"Status":0}'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["certificate-explorer", "crt.sh service"],
    ["doaj-journal-checker", "DOAJ service"],
    ["dictionary", "Dictionary API"],
  ])("shows friendly busy errors for %s", async (slug, service) => {
    for (const status of [429, 500, 503]) {
      sessionStorage.clear();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status }));
      render(<FreeTool slug={slug} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Search" }));
      expect((await screen.findByRole("alert")).textContent).toBe(
        `${service} is temporarily busy. Please try again shortly.`,
      );
      expect(sessionStorage.length).toBe(0);
      cleanup();
      vi.restoreAllMocks();
    }
  });
});