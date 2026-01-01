import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, Send, Trash2, SmilePlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎾', '🏆', '🔥', '👏', '💪'];

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  reactions: Reaction[];
}

export function MessageBoard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates for messages and reactions
    const messagesChannel = supabase
      .channel('message-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchMessages()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const fetchMessages = async () => {
    // Fetch messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      setLoading(false);
      return;
    }

    // Fetch user profiles for all message authors
    const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
    const messageIds = messagesData?.map(m => m.id) || [];
    
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    // Fetch all reactions for these messages
    const { data: reactionsData } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Group reactions by message
    const reactionsMap = new Map<string, { emoji: string; user_id: string }[]>();
    reactionsData?.forEach(r => {
      if (!reactionsMap.has(r.message_id)) {
        reactionsMap.set(r.message_id, []);
      }
      reactionsMap.get(r.message_id)!.push({ emoji: r.emoji, user_id: r.user_id });
    });

    // Combine messages with profiles and reactions
    const messagesWithData = messagesData?.map(msg => {
      const msgReactions = reactionsMap.get(msg.id) || [];
      
      // Aggregate reactions by emoji
      const emojiCounts = new Map<string, { count: number; userReacted: boolean }>();
      msgReactions.forEach(r => {
        const existing = emojiCounts.get(r.emoji) || { count: 0, userReacted: false };
        existing.count++;
        if (r.user_id === user?.id) existing.userReacted = true;
        emojiCounts.set(r.emoji, existing);
      });

      const reactions: Reaction[] = Array.from(emojiCounts.entries()).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        userReacted: data.userReacted,
      }));

      return {
        ...msg,
        user_profile: profilesMap.get(msg.user_id) || undefined,
        reactions,
      };
    }) || [];

    setMessages(messagesWithData);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } else {
      toast.success('Message deleted');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const message = messages.find(m => m.id === messageId);
    const existingReaction = message?.reactions.find(r => r.emoji === emoji && r.userReacted);

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error) {
        console.error('Error adding reaction:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="section-header text-lg md:text-xl">Message Board</h1>
        <p className="text-muted-foreground mt-2 ml-4 md:ml-5 text-sm md:text-base">
          Share updates and communicate with fellow members
        </p>
      </div>

      {/* Message Input */}
      <div className="bg-card rounded-lg border border-border p-3 md:p-4 shadow-card">
        <div className="flex gap-2 md:gap-3">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary font-serif font-bold text-sm md:text-base">
              {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 md:space-y-3">
            <Textarea
              placeholder="Write a message to the club..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] md:min-h-[80px] resize-none text-sm md:text-base"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sending}
                className="gap-2 text-sm"
                size="sm"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Post Message</span>
                <span className="sm:hidden">Post</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="p-3 md:p-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="font-serif text-base md:text-lg font-semibold">Recent Messages</h3>
        </div>

        {messages.length === 0 ? (
          <div className="p-6 md:p-8 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm md:text-base">No messages yet. Be the first to post!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] md:h-[400px]">
            <div className="divide-y divide-border">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="p-3 md:p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex gap-2 md:gap-3">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                      <AvatarImage src={message.user_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary font-serif font-bold text-sm md:text-base">
                        {message.user_profile?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-foreground text-sm md:text-base">
                            {message.user_profile?.display_name || 'Unknown User'}
                          </span>
                          <span className="text-[10px] md:text-xs text-muted-foreground">
                            {format(parseISO(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {user?.id === message.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive self-end sm:self-auto"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                         )}
                      </div>
                      <p className="mt-1 text-foreground whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {/* Reactions */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Existing reactions */}
                        {message.reactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors",
                              reaction.userReacted
                                ? "bg-primary/20 border border-primary/30"
                                : "bg-muted hover:bg-muted/80 border border-transparent"
                            )}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {reaction.count}
                            </span>
                          </button>
                        ))}
                        
                        {/* Add reaction button */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <SmilePlus className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="flex gap-1">
                              {REACTION_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
