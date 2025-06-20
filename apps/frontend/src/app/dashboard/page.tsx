'use client';

import PageContainer from '@/components/layout/page-container';
import { OverviewCards } from '@/features/overview/components/OverviewCards';
import { OverviewCardsSkeleton } from '@/features/overview/components/OverviewCardsSkeleton';
import {
  ConversationsStatusChart,
  DealsFunnelChart
} from '@/features/overview/components/OverviewCharts';
import { OverviewChartsSkeleton } from '@/features/overview/components/OverviewChartsSkeleton';
import { OverviewEventsTableSkeleton } from '@/features/overview/components/OverviewEventsTableSkeleton';
import {
  DealsByProductChart,
  DealsTimelineChart
} from '@/features/overview/components/OverviewExtraCharts';
import { OverviewExtraChartsSkeleton } from '@/features/overview/components/OverviewExtraChartsSkeleton';
import { OverviewFilters } from '@/features/overview/components/OverviewFilters';
import { RecentEventsTable } from '@/features/overview/components/OverviewTables';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  // Filtros globais
  const [period, setPeriod] = React.useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    return { start, end };
  });
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [cardsData, setCardsData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [convStatusData, setConvStatusData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [byProductData, setByProductData] = useState<any[]>([]);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [criticalConvs, setCriticalConvs] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const isMock = searchParams?.get('m') === '1';

  // Buscar produtos do seller
  useEffect(() => {
    (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('seller_id', session.user.id)
        .eq('status', 'active');
      if (!error && data) setProducts(data);
    })();
  }, []);

  // Buscar dados do overview
  useEffect(() => {
    if (products.length === 0) return;
    (async () => {
      setLoading(true);
      if (isMock) {
        // MOCK DATA
        const mockProducts = [
          { id: 'p1', name: 'Produto A' },
          { id: 'p2', name: 'Produto B' },
          { id: 'p3', name: 'Produto C' }
        ];
        setProducts(mockProducts);
        setCardsData({
          totalDeals: 120,
          dealsWon: 45,
          conversionRate: 37.5,
          closedValue: 15000,
          activeProducts: 3,
          activeWhatsapp: 2,
          openConversations: 8,
          pendingConversations: 3,
          pausedConversations: 1,
          closedConversations: 20,
          errorConversations: 2,
          unhandledConversations: 1
        });
        setFunnelData([
          { status: 'open', count: 30 },
          { status: 'won', count: 45 },
          { status: 'lost', count: 20 },
          { status: 'paused', count: 5 }
        ]);
        setConvStatusData([
          { status: 'open', count: 8 },
          { status: 'pending response', count: 3 },
          { status: 'paused', count: 1 },
          { status: 'closed', count: 20 },
          { status: 'error', count: 2 },
          { status: 'unhandled message', count: 1 }
        ]);
        setTimelineData([
          { date: '2025-06-01', created: 10, won: 3 },
          { date: '2025-06-02', created: 12, won: 4 },
          { date: '2025-06-03', created: 8, won: 2 }
        ]);
        setByProductData([
          { product: 'Produto A', count: 50 },
          { product: 'Produto B', count: 40 },
          { product: 'Produto C', count: 30 }
        ]);
        setRecentDeals([
          {
            id: 'd1',
            customer: 'Cliente 1',
            product: 'Produto A',
            status: 'won',
            value: 'R$ 5000',
            date: '2025-06-01'
          },
          {
            id: 'd2',
            customer: 'Cliente 2',
            product: 'Produto B',
            status: 'open',
            value: 'R$ 2000',
            date: '2025-06-02'
          }
        ]);
        setCriticalConvs([
          {
            id: 'c1',
            customer: 'Cliente 3',
            product: 'Produto C',
            status: 'error',
            updated_at: '2025-06-03'
          }
        ]);
        setRecentEvents([
          {
            id: 'e1',
            type: 'Venda',
            description: 'Novo deal criado',
            product_id: 'p1',
            date: '2025-06-01'
          },
          {
            id: 'e2',
            type: 'Conversa',
            description: 'Conversa iniciada',
            product_id: 'p2',
            date: '2025-06-02'
          },
          {
            id: 'e3',
            type: 'Erro',
            description: 'Erro no WhatsApp',
            product_id: 'p3',
            date: '2025-06-03'
          }
        ]);
        setLoading(false);
        return;
      }
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const sellerId = session.user.id;
      // Filtros
      const start = period.start.toISOString();
      const end = period.end.toISOString();
      const productFilter =
        selectedProducts.length > 0
          ? selectedProducts
          : products.map((p) => p.id);
      // Deals
      let dealsQuery = supabase
        .from('deals')
        .select('*')
        .eq('seller_id', sellerId)
        .gte('created_at', start)
        .lte('created_at', end);
      if (productFilter.length > 0)
        dealsQuery = dealsQuery.in('product_id', productFilter);
      const { data: deals = [] } = await dealsQuery;
      const dealsArr = Array.isArray(deals) ? deals : [];
      // Cards
      const totalDeals = dealsArr.length;
      const dealsWon = dealsArr.filter((d) => d.status === 'won').length;
      const dealsLost = dealsArr.filter((d) => d.status === 'lost').length;
      const conversionRate = totalDeals
        ? Math.round((dealsWon / totalDeals) * 1000) / 10
        : 0;
      const closedValue = dealsArr
        .filter((d) => d.status === 'won')
        .reduce((acc, d) => acc + (d.closing_value || 0), 0);
      // Funil
      const funnelMap: Record<string, number> = {};
      dealsArr.forEach((d) => {
        funnelMap[d.status] = (funnelMap[d.status] || 0) + 1;
      });
      const funnelDataArr = Object.entries(funnelMap).map(
        ([status, count]) => ({ status, count })
      );
      // Timeline
      const timelineMap: Record<string, { created: number; won: number }> = {};
      dealsArr.forEach((d) => {
        const date = d.created_at.slice(0, 10);
        if (!timelineMap[date]) timelineMap[date] = { created: 0, won: 0 };
        timelineMap[date].created++;
        if (d.status === 'won') timelineMap[date].won++;
      });
      const timelineArr = Object.entries(timelineMap).map(([date, v]) => ({
        date,
        ...v
      }));
      // Deals por produto
      const byProductMap: Record<string, number> = {};
      dealsArr.forEach((d) => {
        byProductMap[d.product_id] = (byProductMap[d.product_id] || 0) + 1;
      });
      const byProductArr = productFilter.map((pid) => {
        const prod = products.find((p) => p.id === pid);
        return { product: prod?.name || pid, count: byProductMap[pid] || 0 };
      });
      // Recent deals
      const recentDealsArr = dealsArr
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 10)
        .map((d) => ({
          id: d.id,
          customer: d.customer_name || d.customer || '-',
          product: products.find((p) => p.id === d.product_id)?.name || '-',
          status: d.status,
          value: d.closing_value ? `R$ ${d.closing_value}` : '-',
          date: d.created_at.slice(0, 10)
        }));
      // Produtos ativos
      const activeProducts = products.length;
      // WhatsApp numbers
      const { data: whatsappNumbers = [] } = await supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'open');
      const activeWhatsapp = (whatsappNumbers ?? []).length;
      // Conversas
      let convQuery = supabase
        .from('conversations')
        .select('*')
        .eq('seller_id', sellerId)
        .gte('created_at', start)
        .lte('created_at', end);
      if (productFilter.length > 0)
        convQuery = convQuery.in('product_id', productFilter);
      const { data: conversations = [] } = await convQuery;
      const conversationsArr = Array.isArray(conversations)
        ? conversations
        : [];
      // Conversas por status
      const convStatusMap: Record<string, number> = {};
      conversationsArr.forEach((c: any) => {
        convStatusMap[c.conversation_status] =
          (convStatusMap[c.conversation_status] || 0) + 1;
      });
      const convStatusArr = [
        'open',
        'pending response',
        'paused',
        'closed',
        'error',
        'unhandled message'
      ].map((status) => ({ status, count: convStatusMap[status] || 0 }));
      // Conversas críticas
      const criticalConvsArr = conversationsArr
        .filter((c: any) =>
          ['error', 'unhandled message', 'pending response'].includes(
            c.conversation_status
          )
        )
        .sort((a: any, b: any) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, 10)
        .map((c: any) => ({
          id: c.id,
          customer: c.customer_name || c.customer || '-',
          product: products.find((p) => p.id === c.product_id)?.name || '-',
          status: c.conversation_status,
          updated_at: c.updated_at?.slice(0, 10) || '-'
        }));
      // Recent events (mock: pode ser ajustado para buscar de uma tabela de eventos)
      const recentEventsArr: any[] = [];
      // Cards data
      setCardsData({
        totalDeals,
        dealsWon,
        conversionRate,
        closedValue,
        activeProducts,
        activeWhatsapp,
        openConversations: convStatusMap['open'] || 0,
        pendingConversations: convStatusMap['pending response'] || 0,
        pausedConversations: convStatusMap['paused'] || 0,
        closedConversations: convStatusMap['closed'] || 0,
        errorConversations: convStatusMap['error'] || 0,
        unhandledConversations: convStatusMap['unhandled message'] || 0
      });
      setFunnelData(funnelDataArr);
      setConvStatusData(convStatusArr);
      setTimelineData(timelineArr);
      setByProductData(byProductArr);
      setRecentDeals(recentDealsArr);
      setCriticalConvs(criticalConvsArr);
      setRecentEvents(recentEventsArr);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedProducts]);

  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col'>
        <h1 className='mb-2 text-3xl font-bold'>Dashboard Overview</h1>
        <p className='text-muted-foreground mb-8'>
          All your sales, products, WhatsApp and conversations in one place. Use
          the filters to customize your view.
        </p>
        <OverviewFilters
          period={period}
          setPeriod={setPeriod}
          products={products}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
        {loading || !cardsData ? (
          <>
            <OverviewCardsSkeleton />
            <OverviewChartsSkeleton />
            <OverviewExtraChartsSkeleton />
            <OverviewEventsTableSkeleton />
          </>
        ) : (
          <>
            <div className='mb-8'>
              <OverviewCards data={cardsData} />
            </div>
            <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <DealsTimelineChart data={timelineData} />
              <DealsFunnelChart data={funnelData} />
            </div>
            <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <ConversationsStatusChart data={convStatusData} />
              <DealsByProductChart data={byProductData} />
            </div>
            <RecentEventsTable
              data={recentEvents}
              products={products}
              selectedProducts={selectedProducts}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
