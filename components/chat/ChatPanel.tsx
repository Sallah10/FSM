'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Pencil, SendHorizontal, Trash2 } from 'lucide-react';
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
    editedAt: row.edited_at ? String(row.edited_at) : null,
    createdAt: String(row.created_at),
  };
}

export function ChatPanel({
  roomId,
  initialMessages,
  currentUserId,
  currentUserName,
  title = 'Team chat',
  description,
  className,
  heightClass = 'h-[26rem]',
}: {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  currentUserName?: string | null;
  title?: string;
  description?: string;
  className?: string;
  heightClass?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [typingName, setTypingName] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSent = useRef(0);
  const router = useRouter();

  // Opening the team channel marks it read; refresh once so the sidebar badge
  // (rendered by the preserved layout) clears too.
  useEffect(() => {
    if (roomId !== 'general') return;
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function merge(incoming: Message[]) {
    setMessages((prev) => {
      const seen = new Set(prev.map((message) => message.id));
      const next = incoming.filter((message) => !seen.has(message.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }

  function applyUpdate(next: Message) {
    setMessages((prev) =>
      prev.some((message) => message.id === next.id)
        ? prev.map((message) => (message.id === next.id ? { ...message, ...next } : message))
        : [...prev, next],
    );
  }

  function remove(id: string) {
    if (!id) return;
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isRealtimeConfigured()) return;
    let cancelled = false;
    let typingTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const supabase = getSupabase();
      const token = await fetchRealtimeToken();
      if (!supabase || !token || cancelled) return;

      await supabase.realtime.setAuth(token);
      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            if (cancelled) return;
            if (payload.eventType === 'DELETE') {
              remove(String(payload.old?.id ?? ''));
            } else if (payload.new) {
              applyUpdate(rowToMessage(payload.new));
            }
          },
        )
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (cancelled) return;
          const data = payload as { userId?: string; name?: string };
          if (!data?.userId || data.userId === currentUserId || !data.name) return;
          setTypingName(data.name);
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => setTypingName(null), 3000);
        })
        .subscribe((status) => {
          if (!cancelled) setLive(status === 'SUBSCRIBED');
        });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      clearTimeout(typingTimer);
      const supabase = getSupabase();
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId]);

  // Tell everyone else in the room we're typing (rate-limited to ~1.5s).
  function announceTyping() {
    const channel = channelRef.current;
    if (!channel || !currentUserName) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 1500) return;
    lastTypingSent.current = now;
    void channel
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, name: currentUserName },
      })
      .catch(() => undefined);
  }

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

  function startEdit(message: Message) {
    setEditingId(message.id);
    setEditDraft(message.body);
    setPendingDelete(null);
  }

  async function saveEdit() {
    const body = editDraft.trim();
    if (!editingId || !body) return;
    const res = await fetch(`/api/messages/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = (await res.json()) as { message?: Message };
      if (data.message) applyUpdate(data.message);
      setEditingId(null);
      setEditDraft('');
    }
  }

  async function removeMessage(id: string) {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      remove(id);
      setPendingDelete(null);
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
            const editing = editingId === message.id;
            return (
              <div
                key={message.id}
                className={cn(
                  'group flex items-end gap-2',
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
                  {editing ? (
                    <div className="flex w-72 flex-col gap-2 rounded-lg border bg-background p-2">
                      <Textarea
                        value={editDraft}
                        onChange={(event) => setEditDraft(event.target.value)}
                        rows={2}
                        className="min-h-9 resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void saveEdit()}
                          disabled={!editDraft.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm',
                        own
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] text-muted-foreground">
                      {own ? 'You' : message.authorName} ·{' '}
                      {formatTime(message.createdAt)}
                      {message.editedAt ? ' · edited' : ''}
                    </span>
                    {own && !editing ? (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          type="button"
                          aria-label="Edit message"
                          onClick={() => startEdit(message)}
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3" />
                        </button>
                        {pendingDelete === message.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void removeMessage(message.id)}
                              className="rounded px-1 text-[11px] font-medium text-destructive"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(null)}
                              className="rounded px-1 text-[11px] text-muted-foreground"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            aria-label="Delete message"
                            onClick={() => setPendingDelete(message.id)}
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {typingName ? (
        <p className="px-4 pb-1 text-[11px] italic text-muted-foreground">
          {typingName} is typing…
        </p>
      ) : null}

      <div className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value) announceTyping();
          }}
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
