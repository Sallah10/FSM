import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { getInvoice } from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { InvoiceStatusSelect } from '@/components/invoices/InvoiceStatusSelect';
import { PrintButton } from '@/components/invoices/PrintButton';
import { InvoiceBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireRole('admin', 'dispatcher');
  const { id } = await params;
  const invoice = await getInvoice(orgId, id);
  if (!invoice) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Invoice ${invoice.id}`}
        description={invoice.customer}
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.id },
        ]}
        actions={
          <>
            <PrintButton />
            <ConfirmDelete
              url={`/api/invoices/${invoice.id}`}
              title="Delete this invoice?"
              description="This cannot be undone."
              redirectTo="/invoices"
            >
              <Button variant="outline" size="icon" aria-label="Delete invoice">
                <Trash2 />
              </Button>
            </ConfirmDelete>
          </>
        }
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Bill to</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {invoice.customerId ? (
                <Link href={`/customers/${invoice.customerId}`} className="hover:text-brand">
                  {invoice.customer}
                </Link>
              ) : (
                invoice.customer
              )}
            </span>
            <span className="text-muted-foreground">
              Issued {formatDate(invoice.date)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
            <InvoiceBadge status={invoice.status} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-0">Description</TableHead>
                <TableHead className="pr-0 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoice.items ?? []).map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell className="pl-0">{item.name}</TableCell>
                  <TableCell className="pr-0 text-right tabular-nums">
                    {formatCurrency(item.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell className="pl-0">Total</TableCell>
                <TableCell className="pr-0 text-right text-base font-semibold tabular-nums">
                  {formatCurrency(invoice.amount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
