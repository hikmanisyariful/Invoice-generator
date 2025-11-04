"use client";

import InvoiceDetailPage from '@/views/invoices/InvoiceDetail'
import { useParams } from 'next/navigation';
import React from 'react'

export default function Detailpage() {
    /// get param app router nextjs
    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return <div>Invoice not found</div>;
    }

  return (
    <div><InvoiceDetailPage params={{ id }} /></div>
  )
}
