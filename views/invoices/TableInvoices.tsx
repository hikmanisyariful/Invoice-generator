'use client';

import React from 'react';
import useSWR from 'swr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

type Invoice = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  issueDate: string; // "YYYY-MM-DD"
  dueDate: string; // "YYYY-MM-DD"
  status: string; // 'Draft' | 'Sent' | 'Paid' | 'Cancelled'
  totalAmount: string; // NUMERIC from PG -> string
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// helpers
const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
    n
  );

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

export default function TableInvoices() {
  const { data, error, isLoading } = useSWR<Invoice[]>(
    '/api/invoices',
    fetcher
  );

  if (error) return <>An error has occurred.</>;
  if (isLoading || !data) return <>Loading...</>;

  const grandTotal = data.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px]">Invoice Number</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((invoice: Invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              {invoice.invoiceNumber}
            </TableCell>
            <TableCell>
              <div className="font-medium">{invoice.clientName}</div>
              <div className="text-xs text-muted-foreground">
                {invoice.clientAddress}
              </div>
            </TableCell>
            <TableCell>{fmtDate(invoice.issueDate)}</TableCell>
            <TableCell>{fmtDate(invoice.dueDate)}</TableCell>
            <TableCell className="text-right">
              {fmtIDR(Number(invoice.totalAmount))}
            </TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>
              {/* ganti dengan Link/Button sesuai kebutuhan */}
              <Link href={`/invoices/${invoice.id}`}>Detail</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
