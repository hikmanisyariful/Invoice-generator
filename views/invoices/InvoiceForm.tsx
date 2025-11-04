'use client';

import { useFieldArray, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrashIcon, PlusIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { RHFTextField } from '../hooks/RHFTextField';
import { RHFDateInputPicker } from '../hooks/RHFDatePicker';
import { z } from 'zod';
import { RHFTextArea } from '../hooks/RHFTextArea';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/context/SnackbarContext';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be >= 0'),
});

const schema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientAddress: z.string().min(1, 'Client address is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof schema>;

export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `INV-${year}-${random}`;
}

async function createInvoice(url: string, { arg }: { arg: FormValues }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

export default function InvoiceForm() {
  const router = useRouter();
  const { showMessage } = useSnackbar();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 500 }],
    },
  });

  const { control, handleSubmit, register, watch } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items = watch('items');
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const { trigger, isMutating } = useSWRMutation(
    '/api/invoices',
    createInvoice
  );

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount: values.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0
      ),
    };

    try {
      const data = await trigger(payload);
      showMessage({
        title: 'Invoice Created',
        description: `Invoice ${data.invoice.invoiceNumber} has been generated successfully!`,
        variant: 'success',
      });
      router.push(`/`);
      methods.reset(); // clear form
    } catch (error: any) {
      showMessage({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'error',
      });
      console.error('Create invoice error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto p-6 space-y-6 border-2 border-dashed rounded-md"
      >
        <h1 className="text-2xl font-bold">Invoice</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status="Draft" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" className="w-full mt-4" disabled={isMutating}>
              {isMutating ? 'Submitting...' : 'Generate Invoice'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RHFTextField<FormValues>
            name="invoiceNumber"
            label="Invoice Number"
            placeholder="AUTO"
            disabled
          />
          <RHFDateInputPicker<FormValues>
            name="invoiceDate"
            label="Invoice Date"
          />
        </div>

        <div>
          <RHFTextField<FormValues>
            name="clientName"
            label="Client Name"
            placeholder="Enter client name"
            requiredMark
          />
        </div>

        <div>
          <RHFTextArea
            name="clientAddress"
            label="Client Address"
            placeholder="Enter address"
            requiredMark
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RHFDateInputPicker<FormValues> name="issueDate" label="Issue Date" />
          <RHFDateInputPicker<FormValues> name="dueDate" label="Due Date" />
        </div>

        {/* Items table */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="w-32 text-right">Total</TableHead>
                <TableHead className="w-16 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <RHFTextField
                      name={`items.${index}.description`}
                      label="Description"
                      placeholder="Item description"
                      requiredMark
                    />
                  </TableCell>
                  <TableCell>
                    <RHFTextField
                      name={`items.${index}.quantity`}
                      label="Quantity"
                      placeholder="Item quantity"
                      requiredMark
                      type="number"
                      min={1}
                    />
                  </TableCell>
                  <TableCell>
                    <RHFTextField
                      name={`items.${index}.unitPrice`}
                      label="Unit Price"
                      placeholder="Item unit price"
                      requiredMark
                      type="number"
                      min={500}
                      step={500}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(
                      items[index].quantity * items[index].unitPrice
                    ).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="disabled:opacity-50"
                    >
                      <TrashIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ description: '', quantity: 1, unitPrice: 500 })
            }
          >
            <PlusIcon className="mr-2" /> Add Item
          </Button>

          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">Total Amount</span>
            <Input
              readOnly
              value={total.toLocaleString('id-ID')}
              className="text-right font-bold"
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
