'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  fetchRealtimeToken,
  getSupabase,
  isRealtimeConfigured,
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
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 600);
    };

    (async () => {
      const supabase = getSupabase();
      const token = await fetchRealtimeToken();
      if (!supabase || !token || cancelled) return;

      await supabase.realtime.setAuth(token);
      channel = supabase.channel(`org:${orgId}`);
      for (const table of tables) {
        channel = channel.on(
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
      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      const supabase = getSupabase();
      if (channel && supabase) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, router]);

  return null;
}
