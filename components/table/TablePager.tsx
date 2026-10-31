import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonClass =
  'inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm font-medium transition-colors';

export function TablePager({
  basePath,
  page,
  total,
  pageSize,
  params,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  params: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const href = (target: number) => {
    const search = new URLSearchParams(params);
    if (target > 1) search.set('page', String(target));
    else search.delete('page');
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const disabledClass = 'pointer-events-none opacity-40';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span className="tabular-nums">
        {total} {total === 1 ? 'item' : 'items'} · page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={href(page - 1)}
          scroll={false}
          aria-disabled={page <= 1}
          className={cn(
            buttonClass,
            page <= 1
              ? disabledClass
              : 'hover:bg-accent hover:text-foreground',
          )}
        >
          <ChevronLeft className="size-4" /> Prev
        </Link>
        <Link
          href={href(page + 1)}
          scroll={false}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonClass,
            page >= totalPages
              ? disabledClass
              : 'hover:bg-accent hover:text-foreground',
          )}
        >
          Next <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
