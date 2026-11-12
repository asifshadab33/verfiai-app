import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyProgress, type ProgressEvent, type ProgressInput } from "@/lib/progress";

export function useVerificationProgress() {
  const [event, setEvent] = useState<ProgressEvent | null>(null);
  const current = useRef<ProgressInput | null>(null);
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  function stop() {
    current.current = null;
    if (channel.current) void supabase.removeChannel(channel.current);
    channel.current = null;
  }
  useEffect(() => stop, []);

  function listen(input: ProgressInput) {
    const subscription = supabase
      .channel(`progress:${input.runId}`)
      .on("broadcast", { event: "progress" }, async ({ payload }) => {
        const next = await verifyProgress(payload, input);
        if (current.current !== input || !next) return;
        setEvent((previous) => (!previous || next.sequence > previous.sequence ? next : previous));
      });
    channel.current = subscription;
    return subscription;
  }

  // Phones pause connections when the tab is hidden or the network drops; rejoin the
  // same signed topic on return so later milestones still arrive. Missed events are not replayed.
  useEffect(() => {
    function rejoin() {
      const input = current.current;
      if (!input || document.visibilityState !== "visible") return;
      const state = channel.current?.state;
      if (state === "joined" || state === "joining") return;
      if (channel.current) void supabase.removeChannel(channel.current);
      listen(input).subscribe();
    }
    document.addEventListener("visibilitychange", rejoin);
    window.addEventListener("online", rejoin);
    return () => {
      document.removeEventListener("visibilitychange", rejoin);
      window.removeEventListener("online", rejoin);
    };
  }, []);

  async function start(): Promise<ProgressInput> {
    stop();
    setEvent(null);
    const input = { runId: crypto.randomUUID(), secret: crypto.randomUUID() };
    current.current = input;
    const subscription = listen(input);
    // Subscribe before dispatch, but never block verification on a broken connection.
    await new Promise<void>((resolve) => {
      const grace = window.setTimeout(resolve, 2500);
      subscription.subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          window.clearTimeout(grace);
          resolve();
        }
      });
    });
    return input;
  }
  return { event, start, stop };
}
