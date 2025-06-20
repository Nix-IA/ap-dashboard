'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function WhatsappInstanceForm() {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('whatsapp_numbers').insert([
      {
        display_name: displayName,
        phone: phone.replace(/^\+/, ''), // store without leading +
        status,
        seller_id: session.user.id
      }
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setDisplayName('');
      setPhone('');
      setStatus('active');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-md space-y-4'>
      <div>
        <label className='mb-1 block text-sm font-medium'>Display Name</label>
        <input
          type='text'
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className='w-full rounded border px-3 py-2'
        />
      </div>
      <div>
        <label className='mb-1 block text-sm font-medium'>
          Phone (international format)
        </label>
        <input
          type='tel'
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
          required
          placeholder='e.g. +5511912345678'
          className='w-full rounded border px-3 py-2'
        />
      </div>
      <div>
        <label className='mb-1 block text-sm font-medium'>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='w-full rounded border px-3 py-2'
        >
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>
      {error && <div className='text-sm text-red-600'>{error}</div>}
      {success && (
        <div className='text-sm text-green-600'>
          Whatsapp instance added successfully!
        </div>
      )}
      <button
        type='submit'
        disabled={loading}
        className='bg-primary hover:bg-primary/90 rounded px-4 py-2 text-white transition'
      >
        {loading ? 'Saving...' : 'Add Whatsapp Instance'}
      </button>
    </form>
  );
}
