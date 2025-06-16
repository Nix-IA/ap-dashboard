import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewChartsSkeleton() {
  return (
    <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <Skeleton className='mb-2 h-5 w-40' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full rounded-lg' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
