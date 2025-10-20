import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useEventStore from '../store/useEventStore';
import toast from 'react-hot-toast';

const useRealtimeRequests = () => {
  const { djProfile } = useAuthStore();
  const { addPendingRequest } = useEventStore();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!djProfile?.id) return;

    // Create subscription channel
    const channel = supabase
      .channel('requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
          filter: `dj_id=eq.${djProfile.id}`,
        },
        (payload) => {
          const newRequest = payload.new;
          
          // Only show notification for pending requests
          if (newRequest.status === 'pending') {
            // Add to store
            addPendingRequest(newRequest);
            
            // Show toast notification
            toast.success(
              `New request: "${newRequest.song_title}"`,
              {
                duration: 5000,
                icon: '🎵',
              }
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [djProfile?.id, addPendingRequest]);

  // Function to manually unsubscribe
  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return { unsubscribe };
};

export default useRealtimeRequests;
