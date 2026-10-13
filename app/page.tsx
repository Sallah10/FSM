import Link from 'next/link';
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileText,
  MapPin,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Briefcase,
    title: 'Job board',
    description:
      'Log work, assign a technician and follow each job from pending through to completed.',
  },
  {
    icon: Wrench,
    title: 'Technicians',
    description:
      'Keep the field team, their roles and their current workload in one place.',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    description:
      'Build line-item invoices and track what is paid, unpaid and overdue.',
  },
  {
    icon: MapPin,
    title: 'Service map',
    description:
      'See jobs, technicians and customers plotted across the city at a glance.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Revenue by month, completion rates and how work is spread across the team.',
  },
  {
    icon: CheckCircle2,
    title: 'Activity trail',
    description:
      'Every status change and assignment is logged against the job history.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">QuickSet</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b">
          <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Field service management
            </p>
            <h1 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Run every job, technician and invoice from one place
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              QuickSet keeps your board organised, your team assigned and your
              billing up to date - without the spreadsheet juggling.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/auth/signup">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">Use the demo</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo - demo@quickset.com / demo123
            </p>

            <a
              href="#features"
              aria-label="Scroll to features"
              className="absolute bottom-8 flex flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Explore
              </span>
              <ChevronDown className="size-4 animate-bounce" />
            </a>
          </div>
        </section>

        <section id="features">
          <div className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
            <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-card p-6">
                    <Icon className="size-5 text-brand" />
                    <h2 className="mt-4 text-sm font-semibold">{feature.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>QuickSet - field service management demo</span>
          <span>Next.js · PostgreSQL · Drizzle</span>
        </div>
      </footer>
    </div>
  );
}
