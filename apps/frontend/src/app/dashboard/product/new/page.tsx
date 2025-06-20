'use client';

import ProductForm from '@/features/products/components/product-form';
import { useSearchParams } from 'next/navigation';

export default function ProductNewPage() {
  // We'll use search params to check for onboarding data
  const searchParams = useSearchParams();
  // In a real app, you might use context or a global store for onboarding data
  // For now, just pass a prop to ProductForm if onboarding=1
  const onboarding = searchParams.get('onboarding') === '1';

  // TODO: Retrieve onboarding data from a global store or context if needed
  // For now, just render the form
  return (
    <ProductForm
      initialData={null}
      pageTitle='Register Product'
      onboarding={onboarding}
    />
  );
}
