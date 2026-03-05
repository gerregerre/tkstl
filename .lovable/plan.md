

## Fix Kockum's Avatar Background Color

**The Problem**: Kockum's avatar has a visibly lighter, more gray background compared to Viktor and Ludvig's dark navy-charcoal backgrounds. I confirmed this by inspecting the leaderboard — it is clearly a different shade.

**The Fix**: Use the AI image editing model to re-process `src/assets/avatars/kockum.png`, feeding it Viktor's avatar as a color reference. The prompt will be explicit about extracting the exact background color from Viktor's image and applying it to Kockum's.

### Approach

1. Create a small backend function (or inline script) that:
   - Reads both `viktor.png` and `kockum.png`
   - Sends them to the image generation model with a very explicit instruction: "Replace the background of the second image with the exact same background color as the first image. The background should be a solid dark navy-charcoal color, approximately #1a1f2e or whatever the exact color is in the reference image."
   - Saves the result back as `kockum.png`

2. Since previous AI image editing attempts have failed to match the color, an alternative and more reliable approach:
   - **Manually set the background color in code**: Instead of relying on the image file alone, add a CSS background color to the avatar container specifically for Kockum (and all players) so the circular avatar has a consistent dark background regardless of minor image variations
   - This would involve updating the avatar display components to add a consistent `bg-[#1a1f2e]` or similar dark background class to all avatar `<img>` containers

### Recommended: Hybrid approach

1. **Re-process the image** one more time with a more aggressive/explicit prompt to the AI image model, using Viktor's avatar as direct pixel reference
2. **Add a fallback CSS background** to avatar containers across the app so that even if images have slight edge differences, the visible background is uniform

### Files to modify
- `src/assets/avatars/kockum.png` — re-generate with correct background
- Optionally: components that render avatars (e.g., `NewLeaderboard`, `PartyPlanners`, `PlayerProfile`) — add a consistent dark background class to avatar containers as a safety net

