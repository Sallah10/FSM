'use client';

import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { SendHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import {
  fetchRealtimeToken,
  getSupabase,
  isRealtimeConfigured,
} from '@/lib/supabase/client';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Row shape as Postgres Changes delivers it (snake_case from the DB).
function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    roomId: String(row.room_id),
    authorId: String(row.author_id),
    authorName: String(row.author_name),
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

export function ChatPanel({
  roomId,
  initialMessages,
  currentUserId,
  title = 'Team chat',
  description,
  className,
  heightClass = 'h-[26rem]',
}: {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  title?: string;
  description?: string;
  className?: string;
  heightClass?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Append incoming messages, skipping ids we already have (our own POST also
  // echoes back through Realtime).
  function merge(incoming: Message[]) {
    setMessages((prev) => {
      const seen = new Set(prev.map((message) => message.id));
      const next = incoming.filter((message) => !seen.has(message.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isRealtimeConfigured()) return;
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    (async () => {
      const supabase = getSupabase();
      const token = await fetchRealtimeToken();
      if (!supabase || !token || cancelled) return;

      await supabase.realtime.setAuth(token);
      channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            if (payload.new) merge([rowToMessage(payload.new)]);
          },
        )
        .subscribe((status) => {
          if (!cancelled) setLive(status === 'SUBSCRIBED');
        });
    })();

    return () => {
      cancelled = true;
      const supabase = getSupabase();
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [roomId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, body }),
      });
      if (res.ok) {
        const data = (await res.json()) as { message?: Message };
        if (data.message) merge([data.message]);
        setDraft('');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-card',
        heightClass,
        className,
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {isRealtimeConfigured() ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'size-1.5 rounded-full',
                live ? 'bg-emerald-500' : 'bg-muted-foreground/40',
              )}
            />
            {live ? 'Live' : 'Connecting'}
          </span>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const own = message.authorId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  own ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback>
                    {initials(message.authorName || '?')}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'flex max-w-[75%] flex-col gap-1',
                    own ? 'items-end' : 'items-start',
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm',
                      own
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  </div>
                  <span className="px-1 text-[11px] text-muted-foreground">
                    {own ? 'You' : message.authorName} ·{' '}
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder={`Message ${title.toLowerCase()}…`}
          rows={1}
          className="min-h-9 max-h-32 flex-1 resize-none"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => void send()}
          disabled={sending || !draft.trim()}
          aria-label="Send message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
