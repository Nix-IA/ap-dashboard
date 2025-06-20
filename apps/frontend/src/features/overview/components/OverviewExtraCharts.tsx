import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
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

export function DealsTimelineChart({ data }: { data: any[] }) {
  // Calculate conversion rate per day
  const dataWithRate = data.map((d) => ({
    ...d,
    conversion: d.created ? (d.won / d.created) * 100 : 0
  }));
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Deals Timeline (with Conversion Rate)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ChartContainer config={{}}>
            <ResponsiveContainer>
              <LineChart
                data={dataWithRate}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis dataKey='date' />
                <YAxis yAxisId='left' allowDecimals={false} />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTimelineTooltip />} />
                <Legend verticalAlign='bottom' />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='created'
                  stroke='#6366f1'
                  name='Created'
                />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='won'
                  stroke='#22d3ee'
                  name='Won'
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='conversion'
                  stroke='#f43f5e'
                  name='Conversion Rate (%)'
                  dot={false}
                  strokeDasharray='5 5'
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTimelineTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  // Find values by dataKey
  const created = payload.find((p: any) => p.dataKey === 'created')?.value;
  const won = payload.find((p: any) => p.dataKey === 'won')?.value;
  const conversion = payload.find(
    (p: any) => p.dataKey === 'conversion'
  )?.value;
  return (
    <div className='border-border/50 bg-background grid min-w-[10rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl'>
      <div className='font-medium'>{label}</div>
      <div>
        <span className='text-muted-foreground'>Created:</span>{' '}
        <span className='font-mono'>{created}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Won:</span>{' '}
        <span className='font-mono'>{won}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Conversion Rate:</span>{' '}
        <span className='font-mono'>
          {typeof conversion === 'number' ? conversion.toFixed(2) : conversion}%
        </span>
      </div>
    </div>
  );
}

export function DealsByProductChart({ data }: { data: any[] }) {
  // Calcular total para %
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: total ? (d.count / total) * 100 : 0
  }));
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Deals by Product (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ChartContainer config={{}}>
            <ResponsiveContainer>
              <BarChart
                data={dataWithPercent}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis dataKey='product' />
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
                <Bar dataKey='percent' fill='#f59e42'>
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
