'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Product } from '@/constants/data';
import { supabase } from '@/lib/supabase';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { mapProductSchemaToForm } from '../product-form';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {};

  const handleUpdate = async () => {
    setLoading(true);
    // Busca o knowledge_base mais recente para o produto
    const { data: kbData, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('product_id', data.id)
      .eq('type', 'json')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    setLoading(false);
    if (error || !kbData) {
      // fallback: redireciona para edição normal
      router.push(`/dashboard/product/${data.id}`);
      return;
    }
    let initialData = null;
    try {
      initialData = mapProductSchemaToForm(
        JSON.parse(kbData.content),
        data.status
      );
    } catch (e) {
      initialData = null;
    }
    // Redireciona para a página de edição, passando initialData via querystring (ou sessionStorage/localStorage)
    if (initialData) {
      // Salva no sessionStorage para ser lido na tela de edição
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'agentpay_product_edit',
          JSON.stringify(initialData)
        );
      }
    }
    router.push(`/dashboard/product/${data.id}`);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={handleUpdate}>
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
