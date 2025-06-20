import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewCardsSkeleton() {
  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <Skeleton className='mb-2 h-5 w-32' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-24' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
