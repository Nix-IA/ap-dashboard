import { fakeProducts, Product } from '@/constants/mock-api';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    // Se for UUID, busca no Supabase
    let data, error;
    if (isNaN(Number(productId))) {
      const res = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      data = res.data;
      error = res.error;
    } else {
      // fallback para mock se for número
      const mock = await fakeProducts.getProductById(Number(productId));
      data = mock.product;
      error = !mock.product;
    }
    product = data as Product;
    if (!product || error) {
      notFound();
    }
    pageTitle = `Edit Product`;
  }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
