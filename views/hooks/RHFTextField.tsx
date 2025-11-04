'use client';

import * as React from 'react';
import { useFormContext, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  requiredMark?: boolean;
  className?: string;
  inputClassName?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function RHFTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  rules,
  disabled,
  requiredMark,
  className,
  inputClassName,
  min,
  max,
  step,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error?.message;

        // numeric enforcement
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (type === 'number') {
            const value = e.target.value;
            if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
              field.onChange(value);
            }
          } else {
            field.onChange(e);
          }
        };

        return (
          <div className={cn('space-y-2', className)}>
            {label && (
              <Label htmlFor={name as string}>
                {label}
                {requiredMark ? <span className="text-destructive"> *</span> : null}
              </Label>
            )}

            <Input
              id={name as string}
              type={type}
              inputMode={type === 'number' ? 'decimal' : undefined}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ''}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              className={cn(
                hasError && 'border-destructive focus-visible:ring-destructive',
                inputClassName
              )}
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
