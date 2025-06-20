import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#22d3ee',
  '#f59e42',
  '#f43f5e',
  '#a3e635',
  '#fbbf24'
];

export function DealsFunnelChart({ data }: { data: any[] }) {
  // Calculate total for %
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: total ? (d.count / total) * 100 : 0
  }));
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Deals by Status (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ChartContainer config={{}}>
            <ResponsiveContainer>
              <BarChart
                data={dataWithPercent}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis dataKey='status' />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const percent =
                          typeof value === 'number' ? value : Number(value);
                        return (
                          <>
                            <span>{percent.toFixed(1)}%</span>
                            <span className='text-muted-foreground ml-2'>
                              ({props.payload.count} deals)
                            </span>
                          </>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey='percent' fill='#6366f1'>
                  {dataWithPercent.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
                {/* Legend removed to avoid colored squares below the chart */}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationsStatusChart({ data }: { data: any[] }) {
  // Calculate total for %
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: total ? (d.count / total) * 100 : 0
  }));
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Conversations by Status (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ChartContainer config={{}}>
            <ResponsiveContainer>
              <BarChart
                data={dataWithPercent}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis dataKey='status' />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const percent =
                          typeof value === 'number' ? value : Number(value);
                        return (
                          <>
                            <span>{percent.toFixed(1)}%</span>
                            <span className='text-muted-foreground ml-2'>
                              ({props.payload.count} conversations)
                            </span>
                          </>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey='percent' fill='#22d3ee'>
                  {dataWithPercent.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
                {/* Legend removed to avoid colored squares below the chart */}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
