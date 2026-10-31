'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TableSearch({
  placeholder,
  value,
  params,
}: {
  placeholder: string;
  value: string;
  params: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onChange = (next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const search = new URLSearchParams(params);
      const query = next.trim();
      if (query) search.set('q', query);
      else search.delete('q');
      search.delete('page');

      const qs = search.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
  };

  return (
    <div className="relative sm:w-64">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}
