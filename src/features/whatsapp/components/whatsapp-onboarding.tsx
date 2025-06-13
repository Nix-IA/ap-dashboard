'use client';
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Step {
  step: 'loading' | 'qrcode' | 'displayName' | 'done' | 'error';
  error?: string;
}

export default function WhatsappOnboarding({
  sellerId,
  onClose,
  onSuccess
}: {
  sellerId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<Step>({ step: 'loading' });
  const [qrcode, setQrcode] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const hasCreatedRef = useRef(false);

  // Start onboarding (garante apenas uma chamada)
  useEffect(() => {
    if (!sellerId || hasCreatedRef.current) return;
    hasCreatedRef.current = true;
    fetch('https://webhook.agentpay.com.br/webhook/whatsapp/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId })
    })
      .then((res) => res.json())
      .then((data) => {
        let qrcodeObj = data.qrcode;
        if (typeof qrcodeObj === 'string') {
          try {
            qrcodeObj = JSON.parse(qrcodeObj);
          } catch {
            setStep({
              step: 'error',
              error: 'QR code inválido retornado pelo backend.'
            });
            return;
          }
        }
        if (!qrcodeObj || !qrcodeObj.code) {
          setStep({
            step: 'error',
            error: 'QR code não encontrado na resposta do backend.'
          });
          return;
        }
        setQrcode(qrcodeObj.code);
        setInstanceName(data.instanceName);
        setStep({ step: 'qrcode' });
      })
      .catch(() =>
        setStep({
          step: 'error',
          error: 'Failed to start WhatsApp onboarding.'
        })
      );
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sellerId]);

  // Poll for connection
  useEffect(() => {
    if (step.step !== 'qrcode' || !instanceName) return;
    pollingRef.current = setInterval(async () => {
      const res = await fetch(
        'https://webhook.agentpay.com.br/webhook/whatsapp/connect/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName })
        }
      );
      const data = await res.json();
      if (data.status === 'open') {
        clearInterval(pollingRef.current!);
        setStep({ step: 'displayName' });
      }
    }, 1500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, instanceName]);

  // Cancel onboarding
  const handleCancel = async () => {
    setStep({ step: 'loading' });
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_WHATSAPP_API_URL ||
        'https://wa.agentpay.com.br/';
      const apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY;
      if (instanceName) {
        await fetch(`${apiUrl}instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            auth: 'apikey',
            apikey: apiKey || ''
          }
        });
      }
    } catch (e) {
      // Optionally handle error
    }
    // Wait 1.5s before closing
    setTimeout(() => {
      setStep({ step: 'done' });
      onClose();
    }, 1500);
  };

  // Save display name
  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep({ step: 'loading' });
    const { error } = await supabase
      .from('whatsapp_numbers')
      .update({ display_name: displayName })
      .eq('instance_name', instanceName);
    if (error) {
      setStep({ step: 'error', error: error.message });
    } else {
      setStep({ step: 'done' });
      onSuccess();
    }
  };

  if (step.step === 'loading') {
    return (
      <div className='flex min-h-[220px] flex-col items-center justify-center gap-4 p-12'>
        <span className='text-primary animate-spin'>
          <Loader2 className='h-8 w-8' />
        </span>
        <div className='text-primary text-lg font-medium'>
          Please wait, processing your request...
        </div>
        <div className='text-muted-foreground text-sm'>
          This may take a few seconds.
        </div>
      </div>
    );
  }
  if (step.step === 'error') {
    return <div className='p-8 text-center text-red-600'>{step.error}</div>;
  }
  if (step.step === 'qrcode') {
    return (
      <div className='flex flex-col items-center gap-4 p-6'>
        <h2 className='text-lg font-semibold'>
          Scan the QR Code with WhatsApp
        </h2>
        <p className='text-muted-foreground max-w-md text-center text-sm'>
          Open WhatsApp on your phone, go to{' '}
          <b>Settings {'>'} Linked Devices</b>, tap <b>Link a Device</b> and
          scan the QR code below to connect your WhatsApp to Agent Pay.
        </p>
        <div className='flex flex-col items-center rounded-lg border bg-white p-4 shadow-md'>
          <QRCodeSVG
            value={qrcode}
            size={220}
            imageSettings={{
              src: '/assets/icons/agentpay-logo.svg',
              height: 48,
              width: 48,
              excavate: true
            }}
            fgColor='#222'
            bgColor='#fff'
            level='H'
            includeMargin
          />
          <div className='text-muted-foreground mt-2 text-xs'>
            QR Code for WhatsApp connection
          </div>
        </div>
        <button
          onClick={handleCancel}
          className='mt-4 rounded bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300'
        >
          Cancel
        </button>
      </div>
    );
  }
  if (step.step === 'displayName') {
    return (
      <form
        onSubmit={handleSaveDisplayName}
        className='flex flex-col items-center gap-4 p-6'
      >
        <h2 className='text-lg font-semibold'>
          Give a name to your WhatsApp instance
        </h2>
        <input
          type='text'
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder='e.g. Support, Sales, Personal...'
          className='w-64 rounded border px-3 py-2'
        />
        <button
          type='submit'
          className='bg-primary hover:bg-primary/90 rounded px-4 py-2 text-white transition'
        >
          Save
        </button>
      </form>
    );
  }
  return null;
}
