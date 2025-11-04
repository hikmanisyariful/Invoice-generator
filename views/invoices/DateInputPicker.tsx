'use client';

import * as React from 'react';
import { format, parse } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  displayFormat?: string; // default: 'dd/MM/yyyy'
  name?: string;
  disabled?: boolean;
  allowTyping?: boolean;
  hasError?: boolean;
};

export function DateInputPicker({
  label,
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  displayFormat = 'dd/MM/yyyy',
  name,
  disabled,
  allowTyping = false,
  hasError = false,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Date | undefined>(value);

  React.useEffect(() => setInternal(value), [value]);

  const str = internal
    ? format(internal, displayFormat, { locale: idLocale })
    : '';

  const handleSelect = (d?: Date) => {
    setInternal(d);
    onChange?.(d);
    setOpen(false);
  };

  // optional: parsing manual kalau allowTyping = true
  const handleTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowTyping) return;
    const v = e.target.value;
    try {
      const parsed = parse(v, displayFormat, new Date(), { locale: idLocale });
      if (!isNaN(parsed.getTime())) {
        setInternal(parsed);
        onChange?.(parsed);
      }
    } catch {
      /* ignore invalid */
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label ? <label className="text-sm font-medium">{label}</label> : null}

      <div className="relative">
        {/* Input sebagai trigger popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              name={name}
              value={str}
              onChange={handleTyped}
              readOnly={!allowTyping}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'text-left pr-16 cursor-pointer',
                disabled && 'cursor-not-allowed',
                hasError && 'border-destructive focus-visible:ring-destructive'
              )}
              onClick={() => setOpen(true)}
            />
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-auto p-0 bg-background border shadow-md rounded-md z-50"
          >
            <Calendar
              mode="single"
              selected={internal}
              onSelect={handleSelect}
              weekStartsOn={1}
              locale={idLocale}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
