import { Badge } from '@/components/ui/badge';
import React from 'react'
import { InvoiceDetail } from './InvoiceDetail';

export default function StatusBadge({ status }: { status: InvoiceDetail['status'] }) {
  const variant =
    status === 'Paid'
      ? 'success'
      : status === 'Sent'
        ? 'secondary'
        : status === 'Cancelled'
          ? 'destructive'
          : 'outline'; // Draft
  // shadcn default hanya "default/secondary/destructive/outline".
  const className =
    status === 'Paid'
      ? 'bg-green-600 text-white'
      : status === 'Cancelled'
        ? 'bg-red-600 text-white'
        : status === 'Sent'
          ? ''
          : 'border-dashed';
  return (
    <Badge variant={variant as any} className={className}>
      {status.toUpperCase()}
    </Badge>
  );
}