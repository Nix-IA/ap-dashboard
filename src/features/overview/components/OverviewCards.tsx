import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OverviewCards({ data }: { data: any }) {
  // Espera-se receber as métricas já filtradas
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Total Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.totalDeals}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Deals Won</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.dealsWon}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.conversionRate}%</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Closed Value</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>R$ {data.closedValue}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Active Products</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.activeProducts}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Active WhatsApp Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.activeWhatsapp}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Open Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.openConversations}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Pending Response</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>
            {data.pendingConversations}
          </span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Paused Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.pausedConversations}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Closed Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold'>{data.closedConversations}</span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Error Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold text-red-500'>
            {data.errorConversations}
          </span>
        </CardContent>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Unhandled Message</CardTitle>
        </CardHeader>
        <CardContent>
          <span className='text-2xl font-bold text-yellow-500'>
            {data.unhandledConversations}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
