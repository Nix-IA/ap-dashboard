import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';

const PERIOD_PRESETS = [
  {
    label: 'Today',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      return { start, end };
    }
  },
  {
    label: 'Last 7 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
  },
  {
    label: 'Last 30 days',
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(end.getDate() - 29);
      return { start, end };
    }
  },
  {
    label: 'This month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end };
    }
  },
  {
    label: 'Last month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    }
  },
  {
    label: 'This year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start, end };
    }
  },
  {
    label: 'Custom range',
    getRange: null
  }
];

function formatPeriodLabel(period: { start: Date; end: Date }): string {
  const { start, end } = period;
  if (!start || !end) return '';
  if (start.toDateString() === end.toDateString()) {
    return start.toISOString().slice(0, 10);
  }
  return `${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)}`;
}

// Global filter for period and products
export function OverviewFilters({
  period,
  setPeriod,
  products,
  selectedProducts,
  setSelectedProducts
}: {
  period: { start: Date; end: Date };
  setPeriod: (p: { start: Date; end: Date }) => void;
  products: { id: string; name: string }[];
  selectedProducts: string[];
  setSelectedProducts: (ids: string[]) => void;
}) {
  const [openProducts, setOpenProducts] = useState(false);
  const [openPeriod, setOpenPeriod] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  // Refs for click outside
  const productsRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openProducts &&
        productsRef.current &&
        !productsRef.current.contains(event.target as Node)
      ) {
        setOpenProducts(false);
      }
      if (
        openPeriod &&
        periodRef.current &&
        !periodRef.current.contains(event.target as Node)
      ) {
        setOpenPeriod(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openProducts, openPeriod]);

  // Default: all products selected, period = today
  React.useEffect(() => {
    if (products.length > 0 && selectedProducts.length === 0) {
      setSelectedProducts(products.map((p) => p.id));
    }
  }, [products, selectedProducts, setSelectedProducts]);

  // Corrigido: seta o período padrão se period.start/end estiverem indefinidos ou inválidos
  React.useEffect(() => {
    const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
    if (!isValidDate(period.start) || !isValidDate(period.end)) {
      const today = PERIOD_PRESETS.find((p) => p.label === 'Today');
      if (today && today.getRange) {
        const { start, end } = today.getRange();
        if (
          !isValidDate(period.start) ||
          !isValidDate(period.end) ||
          period.start.getTime() !== start.getTime() ||
          period.end.getTime() !== end.getTime()
        ) {
          setPeriod({ start, end });
        }
      }
    }
    // eslint-disable-next-line
  }, [period.start, period.end]);

  // Handler for multiple selection
  const handleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };
  // Handler to select all
  const allSelected = selectedProducts.length === products.length;
  const handleSelectAll = () => {
    if (allSelected) setSelectedProducts([]);
    else setSelectedProducts(products.map((p) => p.id));
  };
  // Handler for 'Only this' (Looker style)
  const handleSelectOnly = (id: string) => {
    setSelectedProducts([id]);
  };
  // Dynamic placeholder
  let selectPlaceholder = 'All products';
  if (selectedProducts.length === 1) {
    const prod = products.find((p) => p.id === selectedProducts[0]);
    if (prod) selectPlaceholder = prod.name;
  } else if (
    selectedProducts.length > 1 &&
    selectedProducts.length < products.length
  ) {
    selectPlaceholder = `${selectedProducts.length} selected`;
  } else if (allSelected && products.length > 0) {
    selectPlaceholder = 'All products';
  }

  // Period preset logic
  let currentPreset = PERIOD_PRESETS.find((preset) => {
    if (!preset.getRange) return false;
    const { start, end } = preset.getRange();
    return (
      start.toDateString() === period.start.toDateString() &&
      end.toDateString() === period.end.toDateString()
    );
  });
  const isCustomRange = !currentPreset && period.start && period.end;
  const periodLabel = isCustomRange
    ? formatPeriodLabel(period)
    : currentPreset
      ? currentPreset.label
      : formatPeriodLabel(period);

  return (
    <div className='mb-8 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      {/* Products filter on the left */}
      <div className='order-1 flex w-full flex-col gap-2 md:order-1 md:w-auto md:flex-row md:items-center'>
        <span className='text-muted-foreground mr-0 mb-1 text-sm font-medium md:mr-2 md:mb-0'>
          Products:
        </span>
        {/* Custom dropdown for multi-select */}
        <div className='relative w-full md:w-auto' ref={productsRef}>
          <button
            type='button'
            className='bg-background flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left shadow-xs md:min-w-[260px]'
            onClick={() => setOpenProducts((v) => !v)}
          >
            <span className='max-w-[180px] truncate md:max-w-[200px]'>
              {selectPlaceholder}
            </span>
            <svg
              className='ml-auto size-4 opacity-50'
              viewBox='0 0 20 20'
              fill='none'
            >
              <path
                d='M6 8l4 4 4-4'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {openProducts && (
            <div className='bg-popover absolute z-10 mt-2 max-h-60 w-full min-w-[260px] overflow-auto rounded-md border p-2 shadow-md'>
              <div
                className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 ${allSelected ? 'bg-primary/10 font-bold' : ''}`}
                onClick={handleSelectAll}
              >
                <input
                  type='checkbox'
                  checked={allSelected}
                  readOnly
                  className='mr-2'
                />
                Select all
              </div>
              <div className='my-1 border-b' />
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 ${selectedProducts.includes(p.id) ? 'bg-primary/10 font-bold' : ''}`}
                  onClick={() => handleSelect(p.id)}
                >
                  <input
                    type='checkbox'
                    checked={selectedProducts.includes(p.id)}
                    readOnly
                    className='mr-2'
                  />
                  <span className='max-w-[120px] truncate md:max-w-[150px]'>
                    {p.name}
                  </span>
                  <button
                    type='button'
                    className='text-muted-foreground hover:bg-accent ml-auto rounded border px-2 py-0.5 text-xs'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOnly(p.id);
                    }}
                  >
                    Only
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Period filter on the right, as a select with presets */}
      <div className='order-2 flex w-full flex-col gap-2 md:order-2 md:w-auto md:flex-row md:items-center'>
        <span className='text-muted-foreground mr-0 mb-1 text-sm font-medium md:mr-2 md:mb-0'>
          Period:
        </span>
        <div className='relative w-full md:w-auto' ref={periodRef}>
          <button
            type='button'
            className='bg-background flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left shadow-xs md:min-w-[200px]'
            onClick={() => setOpenPeriod((v) => !v)}
          >
            {periodLabel}
            <svg
              className='ml-auto size-4 opacity-50'
              viewBox='0 0 20 20'
              fill='none'
            >
              <path
                d='M6 8l4 4 4-4'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {openPeriod && (
            <div className='bg-popover absolute z-10 mt-2 max-h-60 w-full min-w-[200px] overflow-auto rounded-md border p-2 shadow-md'>
              {PERIOD_PRESETS.map((preset) => (
                <div
                  key={preset.label}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 ${periodLabel === preset.label ? 'bg-primary/10 font-bold' : ''}`}
                  onClick={() => {
                    if (preset.label === 'Custom range') {
                      setShowCustomForm(true);
                      setOpenPeriod(false);
                      setCustomRange({ from: period.start, to: period.end });
                    } else if (preset.getRange) {
                      setPeriod(preset.getRange());
                      setShowCalendar(false);
                      setShowCustomForm(false);
                      setOpenPeriod(false);
                    }
                  }}
                >
                  {preset.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Calendar for custom range */}
        {showCalendar && (
          <div className='absolute top-full left-0 z-10 w-full min-w-[200px]'>
            <Calendar
              mode='range'
              selected={{ from: period.start, to: period.end }}
              onSelect={(range) => {
                if (
                  range &&
                  'from' in range &&
                  'to' in range &&
                  range.from &&
                  range.to
                ) {
                  setPeriod({ start: range.from, end: range.to });
                  setShowCalendar(false);
                }
              }}
              className='bg-background w-full min-w-[200px] rounded border shadow-sm'
            />
          </div>
        )}
        {/* Mini-form for custom range */}
        {showCustomForm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-popover relative flex w-[95vw] max-w-full min-w-[320px] flex-col gap-4 rounded-md border p-6 shadow-md sm:w-[400px]'>
              <div className='flex flex-col gap-2'>
                <label className='text-muted-foreground text-xs font-medium'>
                  From
                </label>
                <div className='relative'>
                  <button
                    type='button'
                    className='bg-background flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left'
                    onClick={() => {
                      setShowFromCalendar((v) => !v);
                      setShowToCalendar(false);
                    }}
                  >
                    {customRange.from
                      ? customRange.from.toISOString().slice(0, 10)
                      : 'Select date'}
                  </button>
                  {showFromCalendar && (
                    <div className='absolute top-full left-0 z-20 mt-1 w-max'>
                      <Calendar
                        mode='single'
                        selected={customRange.from || undefined}
                        onSelect={(date) => {
                          setCustomRange((prev) => ({
                            ...prev,
                            from: date ?? null
                          }));
                          setShowFromCalendar(false);
                        }}
                        className='bg-background min-w-[220px] rounded border shadow-sm'
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-muted-foreground text-xs font-medium'>
                  To
                </label>
                <div className='relative'>
                  <button
                    type='button'
                    className='bg-background flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left'
                    onClick={() => {
                      setShowToCalendar((v) => !v);
                      setShowFromCalendar(false);
                    }}
                  >
                    {customRange.to
                      ? customRange.to.toISOString().slice(0, 10)
                      : 'Select date'}
                  </button>
                  {showToCalendar && (
                    <div className='absolute top-full left-0 z-20 mt-1 w-max'>
                      <Calendar
                        mode='single'
                        selected={customRange.to || undefined}
                        onSelect={(date) => {
                          setCustomRange((prev) => ({
                            ...prev,
                            to: date ?? null
                          }));
                          setShowToCalendar(false);
                        }}
                        className='bg-background min-w-[220px] rounded border shadow-sm'
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className='mt-2 flex justify-end gap-2'>
                <button
                  type='button'
                  className='bg-muted text-foreground rounded border px-3 py-1'
                  onClick={() => setShowCustomForm(false)}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='bg-primary text-primary-foreground rounded border px-3 py-1'
                  disabled={!customRange.from || !customRange.to}
                  onClick={() => {
                    if (customRange.from && customRange.to) {
                      setPeriod({
                        start: customRange.from,
                        end: customRange.to
                      });
                      setShowCustomForm(false);
                    }
                  }}
                >
                  Apply
                </button>
              </div>
              <button
                type='button'
                className='text-muted-foreground hover:text-foreground absolute top-2 right-2 text-lg'
                onClick={() => setShowCustomForm(false)}
                aria-label='Close'
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
