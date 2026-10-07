import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const joinCommunityWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().trim().email().max(254), consent: z.literal(true), website: z.string().max(200).default("") }).parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { success: true };
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { sha } = await import("./cache.server");
    const { admin } = await import("./db.server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const db = await admin();
    const { error } = await db.rpc("join_community_waitlist", { p_email: data.email.toLowerCase(), p_fingerprint: sha(`community-waitlist|${ip}`) });
    if (error) throw new Error(error.message.includes("rate_limit") ? "Too many requests. Please try again in an hour." : "We couldn’t save your email. Please try again.");
    return { success: true };
  });