import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_team_leaderboard",
  title: "Get doubles team leaderboard",
  description: "Ranked doubles teams with total points, games played and average points per game.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Max teams to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("team_stats")
      .select("player1_name, player2_name, total_points, games_played")
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (data ?? [])
      .map((t) => ({
        team: `${t.player1_name} & ${t.player2_name}`,
        totalPoints: Number(t.total_points ?? 0),
        gamesPlayed: Number(t.games_played ?? 0),
        average:
          Number(t.games_played ?? 0) > 0
            ? Number((Number(t.total_points ?? 0) / Number(t.games_played)).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.average - a.average)
      .map((r, i) => ({ rank: i + 1, ...r }));

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { teams: rows },
    };
  },
});
