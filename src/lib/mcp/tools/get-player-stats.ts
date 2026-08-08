import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_player_stats",
  title: "Get player stats",
  description:
    "Detailed stats for one player by name: points, games, average, win/loss record and recent games.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Player name, e.g. 'Gerard'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ name }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .ilike("name", name)
      .maybeSingle();
    if (playerError) return { content: [{ type: "text", text: playerError.message }], isError: true };
    if (!player) {
      return { content: [{ type: "text", text: `No player named "${name}" found.` }], isError: true };
    }

    const { data: games, error: gamesError } = await supabase
      .from("session_games")
      .select("*")
      .or(
        [
          `team_a_player1.eq.${player.name}`,
          `team_a_player2.eq.${player.name}`,
          `team_b_player1.eq.${player.name}`,
          `team_b_player2.eq.${player.name}`,
        ].join(","),
      )
      .order("session_date", { ascending: false });
    if (gamesError) return { content: [{ type: "text", text: gamesError.message }], isError: true };

    let wins = 0;
    let losses = 0;
    const recent = (games ?? []).map((g) => {
      const onA = g.team_a_player1 === player.name || g.team_a_player2 === player.name;
      const team = onA ? "A" : "B";
      const won = g.winner === team;
      if (won) wins++;
      else losses++;
      return {
        sessionDate: g.session_date,
        gameNumber: g.game_number,
        partner: onA
          ? [g.team_a_player1, g.team_a_player2].find((p) => p && p !== player.name) ?? null
          : [g.team_b_player1, g.team_b_player2].find((p) => p && p !== player.name) ?? null,
        opponents: onA
          ? [g.team_b_player1, g.team_b_player2].filter(Boolean)
          : [g.team_a_player1, g.team_a_player2].filter(Boolean),
        score: `${g.team_a_score ?? 0}-${g.team_b_score ?? 0}`,
        result: won ? "W" : "L",
      };
    });

    const gamesPlayed = Number(player.games_played ?? 0);
    const result = {
      name: player.name,
      totalPoints: Number(player.total_points ?? 0),
      gamesPlayed,
      average:
        gamesPlayed > 0 ? Number((Number(player.total_points ?? 0) / gamesPlayed).toFixed(2)) : 0,
      wins,
      losses,
      winPercentage: wins + losses > 0 ? Number(((wins / (wins + losses)) * 100).toFixed(1)) : 0,
      recentGames: recent.slice(0, 10),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
