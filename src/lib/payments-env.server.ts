import { getRequestHeader } from "@tanstack/react-start/server";
import type { PaddleEnv } from "./paddle.server";

// Never trust a browser-supplied environment for entitlements or price lookup.
export function paymentEnvironment(): PaddleEnv {
  const host = getRequestHeader("host") ?? "";
  return host.includes("localhost") ||
    host.includes("-dev.lovable.app") ||
    host.includes("id-preview--")
    ? "sandbox"
    : "live";
}
