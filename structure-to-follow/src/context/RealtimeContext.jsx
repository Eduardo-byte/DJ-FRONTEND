import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const RealtimeContext = createContext({
  lastMessageEvent: null,
  lastUserEvent: null,
  conversationReadEvent: null,
  markConversationAsRead: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ currentUserId, children }) {
  const messageChannelRef = useRef(null);
  const userChannelRef = useRef(null);
  const [lastMessageEvent, setLastMessageEvent] = useState(null);
  const [lastUserEvent, setLastUserEvent] = useState(null);
  const [conversationReadEvent, setConversationReadEvent] = useState(null);

  // Functions to manage new message conversations
  const markConversationAsRead = (conversationId) => {
    // Trigger an event that the sidebar can listen to
    setConversationReadEvent({ conversationId, timestamp: Date.now() });
  };

  useEffect(() => {
    if (!currentUserId) {
      // Clean up existing channels if user logs out
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
      if (userChannelRef.current) {
        supabase.removeChannel(userChannelRef.current);
        userChannelRef.current = null;
      }
      return;
    }

    // Only create channels if they don't exist yet
    if (!messageChannelRef.current) {
      
      const messageChannel = supabase
        .channel(`messages-global-${currentUserId}`, {
          config: { broadcast: { ack: false }, presence: { key: currentUserId } },
        })
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "messages", 
            filter: `client_id=eq.${currentUserId}` 
          },
          (payload) => {
            setLastMessageEvent(payload);
          }
        )
        .subscribe((status) => {
        });

      messageChannelRef.current = messageChannel;
    }

    if (!userChannelRef.current) {
      
      const userChannel = supabase
        .channel(`users-global-${currentUserId}`, {
          config: { broadcast: { ack: false }, presence: { key: currentUserId } },
        })
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "users"
          },
          (payload) => {
            setLastUserEvent(payload);
          }
        )
        .subscribe((status) => {
        });

      userChannelRef.current = userChannel;
    }

    // Only clean up when user changes or component unmounts (app-level)
    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
      if (userChannelRef.current) {
        supabase.removeChannel(userChannelRef.current);
        userChannelRef.current = null;
      }
    };
  }, [currentUserId]);

  return (
    <RealtimeContext.Provider value={{ 
      lastMessageEvent, 
      lastUserEvent, 
      conversationReadEvent,
      markConversationAsRead
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}
