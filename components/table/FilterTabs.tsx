import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FilterTabs({
  basePath,
  paramKey,
  value,
  options,
  params,
}: {
  basePath: string;
  paramKey: string;
  value: string;
  options: { value: string; label: string }[];
  params: Record<string, string>;
}) {
  const href = (target: string) => {
    const search = new URLSearchParams(params);
    if (target === 'all') search.delete(paramKey);
    else search.set(paramKey, target);
    search.delete('page');
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => (
        <Link
          key={option.value}
          href={href(option.value)}
          scroll={false}
          className={cn(
            'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
