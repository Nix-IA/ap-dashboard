'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';

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

export default function PlatformsSection() {
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [modal, setModal] = useState<null | {
    type: 'config' | 'details';
    platform: any;
  }>(null);
  // Form state
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load seller
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

  // Open configuration modal
  const openConfig = (platform: any) => {
    setModal({ type: 'config', platform });
    setToken('');
    setError('');
  };
  // Open details modal
  const openDetails = (platform: any) => {
    setModal({ type: 'details', platform });
    setToken(seller?.[platform.tokenField] || '');
    setError('');
  };
  // Close modal
  const closeModal = () => {
    setModal(null);
    setToken('');
    setError('');
  };

  // Save token (configuration or editing)
  const handleSave = async () => {
    if (!modal?.platform) return;
    setSaving(true);
    setError('');
    const { supabase } = await import('@/lib/supabase');
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('sellers')
      .update({ [modal.platform.tokenField]: token })
      .eq('id', session.user.id);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    const { data } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setSeller(data);
    setSaving(false);
    closeModal();
  };

  // Remove token
  const handleRemove = async () => {
    if (!modal?.platform) return;
    setSaving(true);
    setError('');
    const { supabase } = await import('@/lib/supabase');
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('sellers')
      .update({ [modal.platform.tokenField]: null })
      .eq('id', session.user.id);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    const { data } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setSeller(data);
    setSaving(false);
    closeModal();
  };

  // Foco automático no input ao abrir modal
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (modal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [modal]);

  return (
    <div className='mt-10'>
      <div className='flex flex-wrap justify-center gap-4 sm:justify-start'>
        {PLATFORMS.map((platform) => {
          const isConfigured = !!seller?.[platform.tokenField];
          const isLoading =
            loading || (saving && modal?.platform?.key === platform.key);
          const handleCardClick = () => {
            if (loading) return;
            if (isConfigured) openDetails(platform);
            else openConfig(platform);
          };
          return (
            <div
              key={platform.key}
              className={`focus-within:ring-primary group relative flex w-44 flex-col items-center rounded-2xl bg-zinc-800 p-6 shadow transition-all focus-within:ring-2 ${!isConfigured ? 'opacity-60' : ''} ${!loading ? 'cursor-pointer duration-200 hover:scale-105 hover:shadow-lg' : ''}`}
              tabIndex={0}
              aria-label={`${platform.name} card`}
              style={{ position: 'relative' }}
              onClick={handleCardClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick();
              }}
              role='button'
            >
              <img
                src={platform.icon}
                alt={platform.name}
                className='mb-2 h-12 w-12'
              />
              <span className='mb-2 text-base font-medium text-white'>
                {platform.name}
              </span>
              {loading ? (
                <span className='text-muted-foreground text-xs'>...</span>
              ) : (
                <div className='mt-2 flex w-full justify-center'>
                  <Button
                    variant='default'
                    size='sm'
                    aria-label={
                      isConfigured
                        ? `View details for ${platform.name}`
                        : `Configure ${platform.name}`
                    }
                    aria-busy={isLoading}
                    className='z-10 cursor-pointer !opacity-100'
                    style={{ opacity: 1 }}
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      isConfigured
                        ? openDetails(platform)
                        : openConfig(platform);
                    }}
                  >
                    {isConfigured
                      ? isLoading
                        ? 'Loading...'
                        : 'Details'
                      : isLoading
                        ? 'Loading...'
                        : 'Configure'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Configuration/details modal */}
      <Dialog
        open={!!modal}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal?.type === 'config' && modal.platform
                ? `Configure ${modal.platform.name}`
                : ''}
              {modal?.type === 'details' && modal.platform
                ? `${modal.platform.name} Details`
                : ''}
            </DialogTitle>
          </DialogHeader>
          {modal?.platform && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className='space-y-4'
            >
              <div>
                <label
                  htmlFor={`token-input-${modal.platform.key}`}
                  className='text-foreground mb-1 block text-sm font-medium'
                >
                  {modal.platform.name} Token
                </label>
                <Input
                  id={`token-input-${modal.platform.key}`}
                  type='text'
                  placeholder={`Enter your ${modal.platform.name} token`}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={saving}
                  ref={inputRef}
                  aria-label={`${modal.platform.name} token input`}
                  autoFocus
                />
                {error && (
                  <div className='text-destructive mt-1 text-xs' role='alert'>
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter className='flex gap-2 pt-2'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='default'
                  disabled={saving || !token}
                  aria-label={`Save ${modal.platform.name} token`}
                  aria-busy={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                {modal.type === 'details' && (
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={handleRemove}
                    disabled={saving}
                    aria-label={`Remove ${modal.platform.name} token`}
                  >
                    Remove
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
