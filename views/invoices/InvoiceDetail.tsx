'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Pencil1Icon, ArrowLeftIcon } from '@radix-ui/react-icons';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StatusBadge from './StatusBadge';

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: string; // NUMERIC dari PG -> string
  lineTotal: number; // kita tampilkan sebagai number nyaman untuk UI
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceDetail = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  issueDate: string; // "YYYY-MM-DD" atau ISO
  dueDate: string; // "YYYY-MM-DD" atau ISO
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
  totalAmount: number; // endpoint detail kita sudah kirim number
  items: InvoiceItem[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);


export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error, isLoading } = useSWR<InvoiceDetail>(
    `/api/invoices/${params.id}`,
    fetcher
  );

  if (error) return <div className="p-6">Gagal memuat invoice.</div>;
  if (isLoading || !data) return <div className="p-6">Memuat…</div>;

  const subtotal = data.items.reduce(
    (s, it) => s + Number(it.lineTotal ?? Number(it.unitPrice) * it.quantity),
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <StatusBadge status={data.status} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-3xl">INVOICE</CardTitle>
          <div className="text-sm text-muted-foreground">
            #{data.invoiceNumber}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Client</div>
              <div className="font-semibold">{data.clientName}</div>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {data.clientAddress}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Issue Date</div>
                <div>{fmtDate(data.issueDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Due Date</div>
                <div>{fmtDate(data.dueDate)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-40">Unit Price</TableHead>
                  <TableHead className="w-44 text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">
                      {it.description}
                    </TableCell>
                    <TableCell>{it.quantity}</TableCell>
                    <TableCell>{fmtIDR(Number(it.unitPrice))}</TableCell>
                    <TableCell className="text-right">
                      {fmtIDR(Number(it.lineTotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex w-full max-w-sm justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">{fmtIDR(subtotal)}</span>
            </div>
            {/* jika ada pajak/diskon bisa ditambah di sini */}
            <div className="flex w-full max-w-sm justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>{fmtIDR(Number(data.totalAmount))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
