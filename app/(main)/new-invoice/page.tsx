import InvoiceForm from '@/views/invoices/InvoiceForm';
import React from 'react';

export default function page() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <InvoiceForm />
    </div>
  );
}
