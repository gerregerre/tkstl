import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_sessions",
  title: "List recorded sessions",
  description:
    "Recorded play sessions, newest first, with every game's teams, scores and winning side.",
  inputSchema: {
    limit: z.number().int().min(1).max(20).default(5).describe("Number of sessions to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("session_games")
      .select("*")
      .order("session_date", { ascending: false })
      .order("game_number", { ascending: true })
      .limit(500);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const byDate = new Map<string, typeof data>();
    for (const g of data ?? []) {
      const key = String(g.session_date);
      if (!byDate.has(key)) byDate.set(key, [] as typeof data);
      byDate.get(key)!.push(g);
    }

    const sessions = [...byDate.entries()].slice(0, limit ?? 5).map(([date, games]) => ({
      sessionDate: date,
      games: (games ?? []).map((g) => ({
        gameNumber: g.game_number,
        teamA: [g.team_a_player1, g.team_a_player2].filter(Boolean),
        teamB: [g.team_b_player1, g.team_b_player2].filter(Boolean),
        teamAScore: g.team_a_score,
        teamBScore: g.team_b_score,
        winner: g.winner,
        format:
          Number(g.team_a_score ?? 0) + Number(g.team_b_score ?? 0) === 0
            ? "Tug Of War"
            : "Scored",
      })),
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }],
      structuredContent: { sessions },
    };
  },
});
