import type { Database } from "@/integrations/supabase/types";

type Role = Database["public"]["Enums"]["app_role"];
type Result = { data: boolean | null; error: unknown };
type AccountClient = {
  rpc(name: "has_active_subscription", args: { user_uuid: string; check_env: string }): PromiseLike<Result>;
  rpc(name: "has_role", args: { _user_id: string; _role: Role }): PromiseLike<Result>;
};

// Identity comes from verified auth middleware, never dashboard input.
export async function readAccountStatus(client: AccountClient, userId: string, environment: string) {
  const roles: Role[] = ["admin", "moderator", "user"];
  const [subscription, ...checks] = await Promise.all([
    client.rpc("has_active_subscription", { user_uuid: userId, check_env: environment }),
    ...roles.map((role) => client.rpc("has_role", { _user_id: userId, _role: role })),
  ]);
  if ([subscription, ...checks].some((result) => result.error || typeof result.data !== "boolean")) {
    throw new Error("Your account details could not load. Please try again.");
  }
  return {
    activeSubscription: subscription.data === true,
    roles: roles.filter((_, index) => checks[index]?.data === true),
  };
}