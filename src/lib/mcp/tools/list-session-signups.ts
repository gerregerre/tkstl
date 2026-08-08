import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_session_signups",
  title: "List session signups",
  description: "Who is signed up for upcoming sessions, including which of the 4 slots are taken.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("session_signups")
      .select("session_date, slot_number, player_name")
      .order("session_date", { ascending: true })
      .order("slot_number", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const byDate = new Map<string, { slot: number; player: string }[]>();
    for (const s of data ?? []) {
      const key = String(s.session_date);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push({ slot: s.slot_number as number, player: s.player_name as string });
    }
    const sessions = [...byDate.entries()].map(([sessionDate, slots]) => ({
      sessionDate,
      slots,
      isFull: slots.length >= 4,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }],
      structuredContent: { sessions },
    };
  },
});
