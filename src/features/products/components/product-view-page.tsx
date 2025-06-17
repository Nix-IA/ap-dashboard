import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let productJson = null;
  let webhookKey = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    // Busca o knowledge_base mais recente para o produto
    let kbData, kbError, productData, productError;
    try {
      const kbRes = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('product_id', productId)
        .eq('type', 'json')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      kbData = kbRes.data;
      kbError = kbRes.error;
    } catch (e) {
      kbData = null;
      kbError = true;
    }
    try {
      const prodRes = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      productData = prodRes.data;
      productError = prodRes.error;
    } catch (e) {
      productData = null;
      productError = true;
    }
    if (!kbData || kbError || !productData || productError) {
      notFound();
    }
    productJson = kbData.content;
    webhookKey = productData.webhook_key;
    pageTitle = `Edit Product`;
    // Passa o product_id para o formulário
    return (
      <ProductForm
        initialData={{
          productJson,
          webhookKey,
          id: productId,
          knowledge_base_id: kbData.id
        }}
        pageTitle={pageTitle}
      />
    );
  }

  return <ProductForm initialData={{}} pageTitle={pageTitle} />;
}
