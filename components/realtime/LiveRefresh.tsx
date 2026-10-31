'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  getSupabase,
  isRealtimeConfigured,
  REALTIME_TOKEN_REFRESH_MS,
  refreshRealtimeAuth,
} from '@/lib/supabase/client';

// Subscribes to row changes for the current org and refreshes the server
// components so lists/stats stay current without a manual reload.
export function LiveRefresh({
  orgId,
  tables = ['jobs', 'invoices'],
}: {
  orgId: string;
  tables?: string[];
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isRealtimeConfigured()) return;
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let tokenTimer: ReturnType<typeof setInterval> | null = null;

    const schedule = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 600);
    };

    async function connect() {
      const supabase = getSupabase();
      if (!supabase || cancelled) return;
      if (!(await refreshRealtimeAuth()) || cancelled) return;

      let next = supabase.channel(`org:${orgId}`);
      for (const table of tables) {
        next = next.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `org_id=eq.${orgId}`,
          },
          schedule,
        );
      }

      next.subscribe((status) => {
        if (cancelled) return;
        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            void reconnect();
          }, 2000);
        }
      });

      channel = next;
    }

    async function reconnect() {
      if (cancelled) return;
      const supabase = getSupabase();
      if (channel && supabase) {
        await supabase.removeChannel(channel);
        channel = null;
      }
      await connect();
    }

    void connect();

    // Keep the Realtime JWT fresh for tabs left open past the 1-hour expiry.
    tokenTimer = setInterval(() => {
      if (!cancelled) void refreshRealtimeAuth();
    }, REALTIME_TOKEN_REFRESH_MS);

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (tokenTimer) clearInterval(tokenTimer);
      const supabase = getSupabase();
      if (channel && supabase) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, router]);

  return null;
}
