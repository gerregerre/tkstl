import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function MessageBoard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('message-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Combine messages with profiles
    const messagesWithProfiles = messagesData?.map(msg => ({
      ...msg,
      user_profile: profilesMap.get(msg.user_id) || null,
    })) || [];

    setMessages(messagesWithProfiles);
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="section-header">Message Board</h1>
        <p className="text-muted-foreground mt-2 ml-5">
          Share updates and communicate with fellow members
        </p>
      </div>

      {/* Message Input */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary font-serif font-bold">
              {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Write a message to the club..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Post Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold">Recent Messages</h3>
        </div>

        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Be the first to post!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-border">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={message.user_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary font-serif font-bold">
                        {message.user_profile?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {message.user_profile?.display_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(message.created_at), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        {user?.id === message.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-foreground whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
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
