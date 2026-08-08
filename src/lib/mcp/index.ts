import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getLeaderboardTool from "./tools/get-leaderboard";
import getTeamLeaderboardTool from "./tools/get-team-leaderboard";
import listSessionsTool from "./tools/list-sessions";
import getPlayerStatsTool from "./tools/get-player-stats";
import listSessionSignupsTool from "./tools/list-session-signups";
import postMessageTool from "./tools/post-message";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "tkstl",
  title: "TKSTL",
  version: "0.1.0",
  instructions:
    "Tools for TKSTL, a tennis league club app. Read the player and doubles-team leaderboards, recorded session results, per-player stats and upcoming session signups, and post to the club message board. Points: scored games use the raw score, Tug of War awards 10 for a win and 5 for a loss; average = total points / games played.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getLeaderboardTool,
    getTeamLeaderboardTool,
    listSessionsTool,
    getPlayerStatsTool,
    listSessionSignupsTool,
    postMessageTool,
  ],
});
