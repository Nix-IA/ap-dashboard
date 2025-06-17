'use client';
import { useEffect, useState } from 'react';

const PLATFORMS = [
  {
    key: 'hotmart',
    name: 'Hotmart',
    icon: '/assets/icons/hotmart.svg',
    tokenField: 'hotmart_token'
  },
  {
    key: 'kiwify',
    name: 'Kiwify',
    icon: '/assets/icons/kiwify.svg',
    tokenField: 'kiwify_token'
  }
];

export default function IntegrationsSection() {
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import('@/lib/supabase');
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return setLoading(false);
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (!error) setSeller(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className='mt-10'>
      <h2 className='mb-4 text-lg font-semibold'>Integrações</h2>
      <div className='flex flex-wrap gap-4'>
        {PLATFORMS.map((platform) => {
          const isConfigured = !!seller?.[platform.tokenField];
          return (
            <div
              key={platform.key}
              className={`flex w-44 flex-col items-center rounded-2xl bg-zinc-800 p-6 shadow transition-all ${!isConfigured ? 'opacity-60' : ''}`}
            >
              <img
                src={platform.icon}
                alt={platform.name}
                className='mb-2 h-12 w-12'
              />
              <span className='mb-2 text-base font-medium'>
                {platform.name}
              </span>
              {loading ? (
                <span className='text-muted-foreground text-xs'>...</span>
              ) : isConfigured ? (
                <button className='rounded bg-teal-700 px-4 py-1 text-sm text-white transition hover:bg-teal-800'>
                  Detalhes
                </button>
              ) : (
                <span className='rounded bg-zinc-700 px-4 py-1 text-sm text-zinc-300'>
                  Instalar
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
