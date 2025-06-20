'use client';

import { OverviewCards } from '@/features/overview/components/OverviewCards';
import {
  ConversationsStatusChart,
  DealsFunnelChart
} from '@/features/overview/components/OverviewCharts';
import {
  DealsByProductChart,
  DealsTimelineChart
} from '@/features/overview/components/OverviewExtraCharts';
import { OverviewFilters } from '@/features/overview/components/OverviewFilters';
import {
  CriticalConversationsTable,
  RecentDealsTable,
  RecentEventsTable
} from '@/features/overview/components/OverviewTables';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';

// Mock data para exemplo inicial
const MOCK_PRODUCTS = [
  { id: '1', name: 'Product A' },
  { id: '2', name: 'Product B' },
  { id: '3', name: 'Product C' }
];

export default function OverviewPage() {
  // Filtros globais
  const [period, setPeriod] = React.useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
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
    (async () => {
      setLoading(true);
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
  }, [period, selectedProducts, products]);

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
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
        <div className='text-muted-foreground py-16 text-center'>
          Loading...
        </div>
      ) : (
        <>
          <OverviewCards data={cardsData} />
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <DealsFunnelChart data={funnelData} />
            <ConversationsStatusChart data={convStatusData} />
          </div>
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <DealsTimelineChart data={timelineData} />
            <DealsByProductChart data={byProductData} />
          </div>
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <RecentDealsTable data={recentDeals} />
            <CriticalConversationsTable data={criticalConvs} />
          </div>
          <RecentEventsTable
            data={recentEvents}
            products={products}
            selectedProducts={selectedProducts}
          />
        </>
      )}
    </div>
  );
}
