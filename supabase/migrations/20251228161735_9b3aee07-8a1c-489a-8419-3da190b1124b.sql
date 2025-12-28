-- Drop the problematic triggers that cause recursion issues
DROP TRIGGER IF EXISTS recalculate_stats_on_insert ON public.session_games;
DROP TRIGGER IF EXISTS recalculate_stats_on_update ON public.session_games;
DROP TRIGGER IF EXISTS recalculate_stats_on_delete ON public.session_games;

-- The recalculation should only happen on demand (via the button), not automatically
-- This prevents the UPDATE without WHERE error and infinite loops