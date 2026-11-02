import { describe, expect, it } from "vitest";
import { diffText } from "./text-diff";

const join = (ops: { type: string; text: string }[], ...types: string[]) => ops.filter(o => types.includes(o.type)).map(o => o.text).join("");

describe("text compare", () => {
  it("reports identical text as fully similar", () => {
    const r = diffText("Same words here.", "Same words here.");
    expect(r.similarity).toBe(1);
    expect(r.ops).toHaveLength(1);
    expect(r.ops[0]!.type).toBe("equal");
  });
  it("marks a replaced word as a deletion plus an insertion", () => {
    const r = diffText("the quick brown fox", "the slow brown fox");
    expect(r.ops.find(o => o.type === "delete")!.text).toBe("quick");
    expect(r.ops.find(o => o.type === "insert")!.text).toBe("slow");
    expect(r.similarity).toBeGreaterThan(0.7);
    expect(r.similarity).toBeLessThan(1);
  });
  it("reconstructs both inputs from the operations", () => {
    const a = "Alpha beta gamma delta. Epsilon zeta eta.", b = "Alpha gamma delta theta. Epsilon zeta iota eta.";
    const r = diffText(a, b);
    expect(join(r.ops, "equal", "delete")).toBe(a);
    expect(join(r.ops, "equal", "insert")).toBe(b);
  });
  it("ignores whitespace-only differences and can ignore case", () => {
    expect(diffText("a  b\nc", "a b c").similarity).toBe(1);
    expect(diffText("Hello World", "hello world").similarity).toBeLessThan(1);
    expect(diffText("Hello World", "hello world", { ignoreCase: true }).similarity).toBe(1);
  });
  it("handles empty sides", () => {
    expect(diffText("", "new text").ops).toEqual([{ type: "insert", text: "new text" }]);
    expect(diffText("old text", "").ops).toEqual([{ type: "delete", text: "old text" }]);
    expect(diffText("", "").similarity).toBe(1);
  });
  it("stays fast and bounded on very large, very different inputs", () => {
    const make = (tag: string) => Array.from({ length: 3000 }, (_, i) => `${tag} line ${i} ${tag}${i % 97} alpha beta gamma`).join("\n");
    const started = Date.now();
    const r = diffText(make("left"), make("right"));
    expect(Date.now() - started).toBeLessThan(8000);
    expect(r.ops.length).toBeGreaterThan(0);
    expect(r.similarity).toBeLessThan(1);
  });
  it("flags inputs over the character cap", () => { expect(diffText("a ".repeat(120000), "b").truncated).toBe(true); });
});
