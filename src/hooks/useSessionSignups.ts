import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SessionSignup {
  id: string;
  session_date: string;
  slot_number: number;
  player_id: string;
  player_name: string;
  signed_up_by: string | null;
  created_at: string;
}

export interface SlotPlayer {
  id: string;
  name: string;
}

// Calculate the next Monday at 19:00 (7 PM)
export function getNextMondaySession(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  // Calculate days until next Monday (Monday = 1)
  let daysUntilMonday = (1 - dayOfWeek + 7) % 7;
  
  // If it's Monday and before 19:00, use today
  // If it's Monday and after 19:00, use next Monday
  if (dayOfWeek === 1) {
    if (hour >= 19) {
      daysUntilMonday = 7;
    } else {
      daysUntilMonday = 0;
    }
  }
  
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(19, 0, 0, 0);
  
  return nextMonday;
}

export function useSessionSignups() {
  const [signups, setSignups] = useState<SessionSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOperating, setIsOperating] = useState(false);
  const { toast } = useToast();
  
  const currentSessionDate = useMemo(() => getNextMondaySession(), []);
  
  // Convert to ISO string for database queries (normalized to start of minute)
  const sessionDateISO = useMemo(() => {
    const date = new Date(currentSessionDate);
    date.setSeconds(0, 0);
    return date.toISOString();
  }, [currentSessionDate]);

  const fetchSignups = useCallback(async () => {
    try {
      // Clean up old sessions first
      await supabase.rpc('cleanup_old_session_signups');
      
      const { data, error } = await supabase
        .from('session_signups')
        .select('*')
        .eq('session_date', sessionDateISO)
        .order('slot_number');

      if (error) {
        console.error('Error fetching signups:', error);
        return;
      }

      setSignups(data || []);
    } catch (err) {
      console.error('Error in fetchSignups:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionDateISO]);

  useEffect(() => {
    fetchSignups();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('session-signups-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'session_signups',
          filter: `session_date=eq.${sessionDateISO}`
        },
        () => fetchSignups()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSignups, sessionDateISO]);

  // Convert signups array to slots array (4 slots, null if empty)
  const slots = useMemo((): (SlotPlayer | null)[] => {
    const slotArray: (SlotPlayer | null)[] = [null, null, null, null];
    
    signups.forEach((signup) => {
      if (signup.slot_number >= 1 && signup.slot_number <= 4) {
        slotArray[signup.slot_number - 1] = {
          id: signup.player_id,
          name: signup.player_name,
        };
      }
    });
    
    return slotArray;
  }, [signups]);

  const filledSlots = useMemo(() => slots.filter(Boolean).length, [slots]);
  const isSessionFull = filledSlots === 4;

  const addPlayer = async (slotNumber: number, player: { id: string; name: string }) => {
    if (isOperating) return;
    setIsOperating(true);

    try {
      const { error } = await supabase
        .from('session_signups')
        .insert({
          session_date: sessionDateISO,
          slot_number: slotNumber,
          player_id: player.id,
          player_name: player.name,
        });

      if (error) {
        console.error('Error adding player:', error);
        toast({
          title: "Error",
          description: error.message.includes('unique') 
            ? "This player is already signed up or slot is taken" 
            : "Failed to add player",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Player Added",
        description: `${player.name} signed up for the session`,
      });
    } catch (err) {
      console.error('Error in addPlayer:', err);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      });
    } finally {
      setIsOperating(false);
    }
  };

  const removePlayer = async (slotNumber: number) => {
    if (isOperating) return;
    setIsOperating(true);

    const signup = signups.find(s => s.slot_number === slotNumber);
    if (!signup) {
      setIsOperating(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('session_signups')
        .delete()
        .eq('id', signup.id);

      if (error) {
        console.error('Error removing player:', error);
        toast({
          title: "Error",
          description: "Failed to remove player",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Player Removed",
        description: `${signup.player_name} removed from the session`,
      });
    } catch (err) {
      console.error('Error in removePlayer:', err);
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive",
      });
    } finally {
      setIsOperating(false);
    }
  };

  // Get signed up player IDs to prevent duplicate signups
  const signedUpPlayerIds = useMemo(() => 
    signups.map(s => s.player_id), 
    [signups]
  );

  return {
    slots,
    loading,
    isOperating,
    currentSessionDate,
    addPlayer,
    removePlayer,
    isSessionFull,
    filledSlots,
    signedUpPlayerIds,
  };
}
