import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  if (!scrollable) {
    return <div className='flex flex-1 p-4 md:px-6'>{children}</div>;
  }
  return (
    <ScrollArea className='h-[calc(100dvh-52px)]'>
      <div className='flex flex-1 p-4 md:px-6'>{children}</div>
    </ScrollArea>
  );
}
