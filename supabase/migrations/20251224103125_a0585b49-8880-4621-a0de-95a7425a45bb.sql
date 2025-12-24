-- Create trigger function to call recalculate_player_stats
CREATE OR REPLACE FUNCTION public.trigger_recalculate_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.recalculate_player_stats();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for INSERT, UPDATE, DELETE on session_games
DROP TRIGGER IF EXISTS recalculate_stats_on_insert ON public.session_games;
CREATE TRIGGER recalculate_stats_on_insert
AFTER INSERT ON public.session_games
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_stats();

DROP TRIGGER IF EXISTS recalculate_stats_on_update ON public.session_games;
CREATE TRIGGER recalculate_stats_on_update
AFTER UPDATE ON public.session_games
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_stats();

DROP TRIGGER IF EXISTS recalculate_stats_on_delete ON public.session_games;
CREATE TRIGGER recalculate_stats_on_delete
AFTER DELETE ON public.session_games
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_stats();