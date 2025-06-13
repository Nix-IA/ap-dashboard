import PageContainer from '@/components/layout/page-container';
import ProductListingShell from './product-listing-shell';

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <ProductListingShell />
    </PageContainer>
  );
}
