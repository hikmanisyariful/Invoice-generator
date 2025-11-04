'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableInvoices from '@/views/invoices/TableInvoices';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col p-8 gap-4">
      <div className="text-4xl font-bold mb-5">List Invoices</div>

      <div>
        <Button>
          <Link href="/new-invoice">Create Invoice</Link>
        </Button>
      </div>

      <TableInvoices />
    </div>
  );
}
