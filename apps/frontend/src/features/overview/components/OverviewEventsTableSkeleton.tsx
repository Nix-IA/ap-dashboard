import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewEventsTableSkeleton() {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>
          <Skeleton className='mb-2 h-5 w-40' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='w-full'>
          <div className='mb-2 flex gap-2'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-4 w-24' />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='mb-2 flex gap-2'>
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className='h-4 w-24' />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
