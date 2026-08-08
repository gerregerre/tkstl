import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_leaderboard",
  title: "Get player leaderboard",
  description:
    "Ranked player leaderboard with total points, games played and average points per game.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Max players to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("players")
      .select("name, total_points, games_played")
      .order("total_points", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (data ?? [])
      .map((p) => ({
        name: p.name as string,
        totalPoints: Number(p.total_points ?? 0),
        gamesPlayed: Number(p.games_played ?? 0),
        average:
          Number(p.games_played ?? 0) > 0
            ? Number((Number(p.total_points ?? 0) / Number(p.games_played)).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.average - a.average)
      .map((r, i) => ({ rank: i + 1, ...r }));

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { players: rows },
    };
  },
});
