'use client';

import * as React from 'react';
import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { format, parse } from 'date-fns';
import { DateInputPicker } from '../invoices/DateInputPicker';

// helpers
const toISO = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : '');
const fromISO = (s?: string) =>
  s ? parse(s, 'yyyy-MM-dd', new Date()) : undefined;

type RHFDateProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
} & Omit<
  React.ComponentProps<typeof DateInputPicker>,
  'name' | 'value' | 'onChange'
>;

export function RHFDateInputPicker<
  TFieldValues extends FieldValues = FieldValues
>({ name, rules, ...rest }: RHFDateProps<TFieldValues>) {
  // 👇 beri generic yang sama di sini
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const valueAsDate = fromISO(field.value as string | undefined);
        return (
          <div>
            <DateInputPicker
              {...rest}
              value={valueAsDate}
              onChange={(d) => field.onChange(toISO(d))}
              hasError={Boolean(fieldState.error)}
            />
            {fieldState.error && (
              <p className="mt-1 text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
