'use client';

import * as React from 'react';
import {
  useFormContext,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  requiredMark?: boolean;
  className?: string;
  textareaClassName?: string;
};

export function RHFTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 4,
  rules,
  disabled,
  requiredMark,
  className,
  textareaClassName,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error?.message;

        return (
          <div className={cn('space-y-2', className)}>
            {label && (
              <Label htmlFor={name as string}>
                {label}
                {requiredMark && <span className="text-destructive"> *</span>}
              </Label>
            )}

            <Textarea
              id={name as string}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              className={cn(
                hasError && 'border-destructive focus-visible:ring-destructive',
                textareaClassName
              )}
              {...field}
            />

            {hasError && (
              <p className="text-sm text-destructive">{fieldState.error?.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
