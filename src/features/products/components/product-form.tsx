'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PAYMENT_OPTIONS = [
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Pix', value: 'pix' },
  { label: 'Billet', value: 'billet' }
];
const PLATFORM_OPTIONS = [
  { label: 'Hotmart', value: 'hotmart' },
  { label: 'Kiwify', value: 'kiwify' }
];

const DEFAULT_PRODUCT: {
  status: string;
  name: string;
  description: string;
  landing_page: string;
  objective: string;
  benefits: string;
  target_audience: string;
  problems_solved: string;
  payment_methods: string[];
  faq: string;
  offers: { title: string; description: string; price: string; url: string }[];
  coupons: { title: string; discount: string; code: string }[];
  platform: string;
  webhook: string;
  delivery_information: string;
  other_relevant_urls: {
    page_title: string;
    description: string;
    url: string;
  }[];
} = {
  status: 'inactive', // default to inactive
  name: '',
  description: '',
  landing_page: '',
  objective: '',
  benefits: '',
  target_audience: '',
  problems_solved: '',
  payment_methods: [],
  faq: '',
  offers: [{ title: '', description: '', price: '', url: '' }],
  coupons: [{ title: '', discount: '', code: '' }],
  platform: '', // no platform selected by default
  webhook: '',
  delivery_information: '',
  other_relevant_urls: []
};

// Transforma o schema do endpoint para o shape do formulário DEFAULT_PRODUCT
export function mapProductSchemaToForm(
  data: any,
  status?: string
): typeof DEFAULT_PRODUCT {
  if (!data) return { ...DEFAULT_PRODUCT };
  return {
    status: status || 'inactive', // Use provided status or default to inactive
    name: data.product?.basic_info?.name || '',
    description: data.product?.basic_info?.description || '',
    landing_page: data.product?.basic_info?.landing_page_url || '',
    objective: data.product?.product_details?.goal || '',
    benefits: data.product?.product_details?.main_benefits || '',
    target_audience: data.product?.product_details?.target_audience || '',
    problems_solved: data.product?.product_details?.problems_solved || '',
    payment_methods:
      data.sales_info?.sales_support?.payment_methods?.map((m: string) =>
        m.toLowerCase()
      ) || [],
    faq:
      typeof data.sales_info?.sales_support?.faq === 'string'
        ? data.sales_info.sales_support.faq
        : '',
    offers: Array.isArray(data.sales_info?.sales_offers?.offers)
      ? data.sales_info.sales_offers.offers.map((o: any) => ({
          title: o.title || '',
          description: o.description || '',
          price: o.price || '',
          url: o.checkout_url || ''
        }))
      : [{ title: '', description: '', price: '', url: '' }],
    coupons: Array.isArray(data.sales_info?.sales_offers?.discount_coupons)
      ? data.sales_info.sales_offers.discount_coupons.map((c: any) => ({
          title: c.title || '',
          discount: c.discount_value || '',
          code: c.coupon_code || ''
        }))
      : [{ title: '', discount: '', code: '' }],
    platform: data.sales_info?.platform || '',
    webhook: '', // webhook is generated later
    delivery_information: data.product?.delivery_information || '',
    other_relevant_urls: Array.isArray(
      data.sales_info?.sales_support?.other_relevant_urls
    )
      ? data.sales_info.sales_support.other_relevant_urls.map((u: any) => ({
          page_title: u.page_title || '',
          description: u.description || '',
          url: u.url || ''
        }))
      : []
  };
}

export default function ProductForm({
  initialData,
  pageTitle,
  onboarding = false
}: {
  initialData: any;
  pageTitle: string;
  onboarding?: boolean;
}) {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [form, setForm] = useState(DEFAULT_PRODUCT);
  const [initialForm, setInitialForm] = useState(DEFAULT_PRODUCT);
  const [showRemoveCoupon, setShowRemoveCoupon] = useState<number | null>(null);
  const [showRemoveOffer, setShowRemoveOffer] = useState<number | null>(null);
  const [showRemoveOtherUrl, setShowRemoveOtherUrl] = useState<number | null>(
    null
  );
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState('product');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [webhookKey, setWebhookKey] = useState<string | null>(null);

  // Add a ref for the description field
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const webhookInputRef = useRef<HTMLInputElement>(null);

  // Refs para campos obrigatórios
  const refs = {
    name: useRef<HTMLInputElement>(null),
    landing_page: useRef<HTMLInputElement>(null),
    description: descriptionRef,
    objective: useRef<HTMLTextAreaElement>(null),
    benefits: useRef<HTMLTextAreaElement>(null),
    target_audience: useRef<HTMLTextAreaElement>(null),
    problems_solved: useRef<HTMLTextAreaElement>(null),
    payment_methods: useRef<HTMLDivElement>(null),
    offers: useRef<HTMLDivElement>(null),
    platform: useRef<HTMLSelectElement>(null),
    delivery_information: useRef<HTMLTextAreaElement>(null),
    faq: useRef<HTMLTextAreaElement>(null),
    other_relevant_urls: useRef<HTMLDivElement>(null),
    coupons: useRef<HTMLDivElement>(null)
  };

  // New state variables for webhook modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookModalUrl, setWebhookModalUrl] = useState<string | null>(null);
  const [webhookModalCopied, setWebhookModalCopied] = useState(false);

  useEffect(() => {
    // Se vier do onboarding
    if (onboarding) {
      try {
        const data = localStorage.getItem('agentpay_product_onboarding');
        if (data) setOnboardingData(JSON.parse(data));
      } catch {}
    }
  }, [onboarding]);

  useEffect(() => {
    // Se onboardingData, usa ela
    if (onboardingData) {
      const mapped = mapProductSchemaToForm(onboardingData);
      setForm(mapped);
      setInitialForm(DEFAULT_PRODUCT); // <- Corrigido: initialForm é o vazio!
    } else if (initialData) {
      // status vem do products
      const status = initialData.status || 'inactive';
      if (initialData.productJson) {
        try {
          const parsed = mapProductSchemaToForm(
            JSON.parse(initialData.productJson),
            status // Pass the status from initialData
          );
          setForm({ ...parsed, status });
          setInitialForm({ ...parsed, status });
          if (initialData.webhookKey) setWebhookKey(initialData.webhookKey);
        } catch {
          setForm({ ...DEFAULT_PRODUCT, status });
          setInitialForm({ ...DEFAULT_PRODUCT, status });
          setWebhookKey(null);
        }
      } else {
        // Normalize payment_methods to always be an array
        let payment_methods = initialData.payment_methods;
        if (!Array.isArray(payment_methods)) {
          if (
            typeof payment_methods === 'string' &&
            payment_methods.length > 0
          ) {
            payment_methods = [payment_methods];
          } else {
            payment_methods = [];
          }
        }
        setForm((prev) => ({
          ...prev,
          ...initialData,
          payment_methods,
          status
        }));
        setInitialForm((prev) => ({
          ...prev,
          ...initialData,
          payment_methods,
          status
        }));
        setWebhookKey(initialData.webhookKey || null);
      }
    }
  }, [onboardingData, initialData]);

  useEffect(() => {
    // Carrega knowledge_base do sessionStorage se existir
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem('agentpay_product_edit');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          // Normalize payment_methods
          let payment_methods = parsed.payment_methods;
          if (!Array.isArray(payment_methods)) {
            if (
              typeof payment_methods === 'string' &&
              payment_methods.length > 0
            ) {
              payment_methods = [payment_methods];
            } else {
              payment_methods = [];
            }
          }
          setForm({ ...parsed, payment_methods });
          setInitialForm({ ...parsed, payment_methods });
          sessionStorage.removeItem('agentpay_product_edit');
        } catch {}
      }
    }
  }, []);

  // Deep compare utility
  function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // Track if form is dirty (compare with initialForm)
  useEffect(() => {
    setIsDirty(!deepEqual(form, initialForm));
  }, [form, initialForm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        payment_methods: checked
          ? [...prev.payment_methods, value]
          : prev.payment_methods.filter((m) => m !== value)
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // New handler for select input
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Offers
  const handleOfferChange = (
    idx: number,
    field: keyof (typeof DEFAULT_PRODUCT)['offers'][0],
    value: string
  ) => {
    setForm((prev) => {
      const offers = [...prev.offers];
      offers[idx] = { ...offers[idx], [field]: value };
      return { ...prev, offers };
    });
  };
  const addOffer = () =>
    setForm((prev) => ({
      ...prev,
      offers: [
        ...prev.offers,
        { title: '', description: '', price: '', url: '' }
      ]
    }));
  const removeOffer = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== idx)
    }));

  // Coupons
  const handleCouponChange = (
    idx: number,
    field: keyof (typeof DEFAULT_PRODUCT)['coupons'][0],
    value: string
  ) => {
    setForm((prev) => {
      const coupons = [...prev.coupons];
      coupons[idx] = { ...coupons[idx], [field]: value };
      return { ...prev, coupons };
    });
  };
  const addCoupon = () =>
    setForm((prev) => ({
      ...prev,
      coupons: [...prev.coupons, { title: '', discount: '', code: '' }]
    }));
  const removeCoupon = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== idx)
    }));

  // Other Relevant URLs
  const handleOtherUrlChange = (
    idx: number,
    field: keyof (typeof DEFAULT_PRODUCT)['other_relevant_urls'][0],
    value: string
  ) => {
    setForm((prev) => {
      const urls = [...prev.other_relevant_urls];
      urls[idx] = { ...urls[idx], [field]: value };
      return { ...prev, other_relevant_urls: urls };
    });
  };
  const addOtherUrl = () =>
    setForm((prev) => ({
      ...prev,
      other_relevant_urls: [
        ...prev.other_relevant_urls,
        { page_title: '', description: '', url: '' }
      ]
    }));
  const removeOtherUrl = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      other_relevant_urls: prev.other_relevant_urls.filter((_, i) => i !== idx)
    }));

  // Description field: update state only on blur and submit
  const handleDescriptionBlur = () => {
    if (descriptionRef.current) {
      setForm((prev) => ({
        ...prev,
        description: descriptionRef.current!.innerHTML
      }));
    }
  };

  // Formatting toolbar for description
  const formatDescription = (command: string, value?: string) => {
    descriptionRef.current?.focus();
    document.execCommand(command, false, value);
  };

  // Helper for offer validation
  const offerFieldErrors = submitAttempted
    ? form.offers.map((offer) => ({
        title: !offer.title.trim(),
        price: !offer.price.trim(),
        url: !offer.url.trim()
      }))
    : form.offers.map(() => ({ title: false, price: false, url: false }));
  const isOfferMissing =
    submitAttempted &&
    (!form.offers ||
      form.offers.length === 0 ||
      form.offers.every(
        (o) => !o.title.trim() || !o.price.trim() || !o.url.trim()
      ));
  const isPaymentMissing =
    submitAttempted &&
    (!form.payment_methods || form.payment_methods.length === 0);
  const isPlatformMissing = submitAttempted && !form.platform;
  const isDeliveryInfoMissing =
    submitAttempted && !form.delivery_information.trim();

  // Helper for URL validation
  function isValidUrl(url: string) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function validateForm() {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('Name');
    if (!form.landing_page.trim()) {
      errors.push('Main Page URL');
    } else if (!isValidUrl(form.landing_page.trim())) {
      errors.push('Main Page URL must be a valid URL');
    }
    if (!form.description.trim() || form.description === '<br>')
      errors.push('Description');
    if (!form.objective.trim()) errors.push('Objective');
    if (!form.benefits.trim()) errors.push('Benefits');
    if (!form.target_audience.trim()) errors.push('Target Audience');
    if (!form.problems_solved.trim()) errors.push('Problems Solved');
    if (!form.delivery_information.trim()) errors.push('Delivery Information');
    if (!form.payment_methods || form.payment_methods.length === 0)
      errors.push('At least one Payment Method');
    if (
      !form.offers ||
      form.offers.length === 0 ||
      form.offers.every(
        (o) =>
          !o.title.trim() ||
          !o.price.trim() ||
          !o.url.trim() ||
          !isValidUrl(o.url.trim())
      )
    ) {
      errors.push(
        'At least one Offer (with title, price, and valid payment page link)'
      );
    }
    if (!form.platform) errors.push('Platform');

    // Validate other_relevant_urls - if any field is filled, page_title and url are required
    form.other_relevant_urls.forEach((urlObj, idx) => {
      const anyFieldFilled = !!(
        urlObj.page_title?.trim() ||
        urlObj.url?.trim() ||
        urlObj.description?.trim()
      );
      if (anyFieldFilled) {
        if (!urlObj.page_title?.trim()) {
          errors.push(`Other URL ${idx + 1}: Page title is required`);
        }
        if (!urlObj.url?.trim()) {
          errors.push(`Other URL ${idx + 1}: URL is required`);
        } else if (!isValidUrl(urlObj.url)) {
          errors.push(`Other URL ${idx + 1}: Must be a valid URL`);
        }
      }
    });

    return errors;
  }

  async function saveProductToSupabase(productJson: any) {
    // Extract summary fields
    const summary = {
      name: form.name,
      platform: form.platform,
      landing_page_url: form.landing_page,
      checkout_url: form.offers[0]?.url || '',
      price: form.offers[0]?.price || '',
      status: form.status || 'inactive' // status sempre salvo em products
    };
    // Get user session for seller_id
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }
    const seller_id = session.user.id;
    let product_id = initialData?.id;
    let productRes;
    if (product_id) {
      // Edit flow: update
      productRes = await supabase
        .from('products')
        .update({ ...summary })
        .eq('id', product_id)
        .select('id')
        .single();
    } else {
      // New flow: insert
      productRes = await supabase
        .from('products')
        .insert([{ ...summary, seller_id }])
        .select('id')
        .single();
      product_id = productRes.data?.id;
    }
    if (productRes.error || !product_id) {
      throw new Error(productRes.error?.message || 'Failed to save product');
    }
    // Save to knowledge_base (content as string)
    let kbRes;
    const contentString = JSON.stringify(productJson);
    if (initialData?.knowledge_base_id) {
      // Edit flow: update knowledge_base
      kbRes = await supabase
        .from('knowledge_base')
        .update({
          product_id,
          type: 'json',
          status: 'active',
          content: contentString
        })
        .eq('id', initialData.knowledge_base_id)
        .select('id')
        .single();
    } else {
      // New flow: insert knowledge_base
      kbRes = await supabase
        .from('knowledge_base')
        .insert([
          {
            product_id,
            type: 'json',
            status: 'active',
            content: contentString
          }
        ])
        .select('id')
        .single();
    }
    if (kbRes.error) {
      // Rollback product insert if new
      if (!initialData?.id && product_id) {
        await supabase.from('products').delete().eq('id', product_id);
      }
      throw new Error(kbRes.error?.message || 'Failed to save product details');
    }
    return { product_id, knowledge_base_id: kbRes.data?.id };
  }

  async function handleRemoveProduct() {
    if (!initialData?.id) return;

    setIsRemoving(true);
    setSaveError(null);

    try {
      // Update product status to "removed"
      const { error } = await supabase
        .from('products')
        .update({ status: 'removed' })
        .eq('id', initialData.id);

      if (error) {
        throw new Error(error.message);
      }

      setIsRemoving(false);
      setShowRemoveDialog(false);

      // Redirect after successful removal
      setTimeout(() => {
        router.push('/dashboard/product');
      }, 1000);
    } catch (err: any) {
      setIsRemoving(false);
      setSaveError(err.message || 'Failed to remove product');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (descriptionRef.current) {
      setForm((prev) => ({
        ...prev,
        description: descriptionRef.current!.innerHTML
      }));
    }
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }
    // --- SERIALIZE TO SCHEMA ---
    const productJson = {
      product: {
        basic_info: {
          name: form.name,
          description: form.description,
          landing_page_url: form.landing_page
        },
        product_details: {
          goal: form.objective,
          main_benefits: form.benefits,
          target_audience: form.target_audience,
          problems_solved: form.problems_solved
        },
        delivery_information: form.delivery_information
      },
      sales_info: {
        platform: form.platform,
        sales_offers: {
          offers: form.offers.map((offer) => ({
            title: offer.title,
            description: offer.description,
            price: offer.price,
            checkout_url: offer.url
          })),
          discount_coupons: form.coupons
            .filter((c) => c.title || c.discount || c.code)
            .map((c) => ({
              title: c.title,
              discount_value: c.discount,
              coupon_code: c.code
            }))
        },
        sales_support: {
          payment_methods: form.payment_methods.map((m) => {
            if (m === 'credit_card') return 'CREDIT_CARD';
            if (m === 'pix') return 'PIX';
            if (m === 'billet') return 'BILLET';
            return m;
          }),
          faq: form.faq || '',
          other_relevant_urls: form.other_relevant_urls
        }
      }
      // Note: status is NOT saved in JSON, only in products table
    };
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { product_id, knowledge_base_id } =
        await saveProductToSupabase(productJson);
      setIsSaving(false);
      setSaveSuccess(true);
      // If this is a new product (no initialData.id), fetch webhook_key and show modal
      if (!initialData?.id && product_id) {
        // Fetch webhook_key and status from products table (do NOT fetch payment_methods)
        const { data, error } = await supabase
          .from('products')
          .select('webhook_key, status')
          .eq('id', product_id)
          .single();
        if (!error && data) {
          const url = `https://webhook.agentpay.com.br/webhook/b3b7cd9b-f318-4a40-9265-7ef2a4714734/platform/${data.webhook_key}`;
          setWebhookModalUrl(url);
          setShowWebhookModal(true);
          // Only update status from DB, keep payment_methods from JSON
          setForm((prev) => ({ ...prev, status: data.status || 'inactive' }));
          setInitialForm((prev) => ({
            ...prev,
            status: data.status || 'inactive'
          }));
          return; // Don't redirect yet, wait for modal close
        }
      }
      setTimeout(() => {
        router.push('/dashboard/product');
      }, 1200);
    } catch (err: any) {
      setIsSaving(false);
      setSaveError(err.message || 'Failed to save product');
    }
  }

  // Add a flag to determine if webhook should be shown
  const showWebhook = Boolean(initialData && initialData.webhook);

  // Mapeamento campo -> aba (corrigido)
  const fieldTabMap: Record<string, string> = {
    name: 'product',
    landing_page: 'product',
    description: 'product',
    objective: 'product',
    benefits: 'product',
    target_audience: 'product',
    problems_solved: 'product',
    delivery_information: 'product',
    payment_methods: 'sales', // corrigido
    offers: 'sales', // corrigido
    platform: 'integrations'
  };

  // Agrupamento de erros por aba
  function groupValidationErrors(errors: string[]) {
    const groups: Record<string, string[]> = {
      'Product Details': [],
      'Sales Details': [],
      Integrations: []
    };
    errors.forEach((err) => {
      if (
        err.toLowerCase().includes('name') ||
        err.toLowerCase().includes('main page url') ||
        err.toLowerCase().includes('description') ||
        err.toLowerCase().includes('objective') ||
        err.toLowerCase().includes('benefits') ||
        err.toLowerCase().includes('target audience') ||
        err.toLowerCase().includes('problems solved') ||
        err.toLowerCase().includes('delivery information')
      ) {
        groups['Product Details'].push(err);
      } else if (
        err.toLowerCase().includes('payment method') ||
        err.toLowerCase().includes('offer') ||
        err.toLowerCase().includes('coupon')
      ) {
        groups['Sales Details'].push(err);
      } else if (err.toLowerCase().includes('platform')) {
        groups['Integrations'].push(err);
      } else {
        // fallback
        groups['Product Details'].push(err);
      }
    });
    return groups;
  }

  // Função utilitária para navegar/focar no primeiro campo obrigatório
  function focusFirstValidationError() {
    if (validationErrors.length > 0) {
      const errorFieldOrder = [
        'name',
        'landing_page',
        'description',
        'objective',
        'benefits',
        'target_audience',
        'problems_solved',
        'delivery_information',
        'payment_methods',
        'offers',
        'platform'
      ];
      const errorField = errorFieldOrder.find((field) =>
        validationErrors.some((err) =>
          err.toLowerCase().includes(field.replace('_', ' '))
        )
      );
      if (errorField) {
        setActiveTab(fieldTabMap[errorField]);
        setTimeout(() => {
          const ref = refs[errorField as keyof typeof refs];
          if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (
              ref.current instanceof HTMLInputElement ||
              ref.current instanceof HTMLTextAreaElement ||
              ref.current instanceof HTMLDivElement
            ) {
              ref.current.focus();
            }
          }
        }, 300);
      }
    }
  }

  // Ao fechar o modal, scroll/foco no primeiro campo faltante
  useEffect(() => {
    if (
      !showValidationModal &&
      submitAttempted &&
      validationErrors.length > 0
    ) {
      focusFirstValidationError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showValidationModal]);

  // Helpers para saber se cada campo está com erro
  const fieldHasError = (field: string) =>
    submitAttempted &&
    validationErrors.some((err) =>
      err.toLowerCase().includes(field.replace('_', ' '))
    );

  // Before rendering checkboxes for payment_methods, ensure array type
  let safePaymentMethods: string[] = [];
  if (Array.isArray(form.payment_methods)) {
    safePaymentMethods = form.payment_methods as string[];
  } else if (typeof form.payment_methods === 'string') {
    const val = String(form.payment_methods);
    safePaymentMethods = val.length > 0 ? [val] : [];
  } else {
    safePaymentMethods = [];
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList>
              <TabsTrigger value='product'>Product Details</TabsTrigger>
              <TabsTrigger value='sales'>Sales Details</TabsTrigger>
              <TabsTrigger value='integrations'>Integrations</TabsTrigger>
            </TabsList>
            <TabsContent value='product'>
              {/* Product details fields */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='name'
                    className='mb-1 block text-sm font-medium'
                  >
                    Product Name <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='name'
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    ref={refs.name}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('name') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('name') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
                <div className='flex flex-col items-end justify-end'>
                  <label className='mb-1 block flex items-center gap-2 text-sm font-medium'>
                    <Switch
                      checked={form.status === 'active'}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          status: checked ? 'active' : 'inactive'
                        }))
                      }
                      className='h-6 w-11 rounded-full'
                    />
                    <span className='ml-2'>
                      {form.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
              <div className='mt-6 flex flex-col'>
                <label
                  htmlFor='description'
                  className='mb-1 block text-sm font-medium'
                >
                  Description <span className='text-red-500'>*</span>
                </label>
                <Textarea
                  id='description'
                  name='description'
                  value={form.description}
                  onChange={handleChange}
                  ref={refs.description}
                  required
                  className={`focus:ring-primary focus:ring-2 ${fieldHasError('description') ? 'border-red-500' : ''}`}
                />
                {fieldHasError('description') && (
                  <span className='text-xs text-red-500'>Required</span>
                )}
              </div>
              <div className='mt-6 flex flex-col'>
                <label
                  htmlFor='landing_page'
                  className='mb-1 block text-sm font-medium'
                >
                  Main Page URL <span className='text-red-500'>*</span>
                </label>
                <Input
                  id='landing_page'
                  name='landing_page'
                  value={form.landing_page}
                  onChange={handleChange}
                  ref={refs.landing_page}
                  required
                  className={`focus:ring-primary focus:ring-2 ${fieldHasError('landing_page') ? 'border-red-500' : ''}`}
                />
                {fieldHasError('landing_page') && (
                  <span className='text-xs text-red-500'>Required</span>
                )}
              </div>
              <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='objective'
                    className='mb-1 block text-sm font-medium'
                  >
                    Objective <span className='text-red-500'>*</span>
                  </label>
                  <Textarea
                    id='objective'
                    name='objective'
                    value={form.objective}
                    onChange={handleChange}
                    ref={refs.objective}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('objective') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('objective') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
              </div>
              <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='benefits'
                    className='mb-1 block text-sm font-medium'
                  >
                    Benefits <span className='text-red-500'>*</span>
                  </label>
                  <Textarea
                    id='benefits'
                    name='benefits'
                    value={form.benefits}
                    onChange={handleChange}
                    ref={refs.benefits}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('benefits') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('benefits') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='target_audience'
                    className='mb-1 block text-sm font-medium'
                  >
                    Target Audience <span className='text-red-500'>*</span>
                  </label>
                  <Textarea
                    id='target_audience'
                    name='target_audience'
                    value={form.target_audience}
                    onChange={handleChange}
                    ref={refs.target_audience}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('target_audience') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('target_audience') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
              </div>
              <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='problems_solved'
                    className='mb-1 block text-sm font-medium'
                  >
                    Problems Solved <span className='text-red-500'>*</span>
                  </label>
                  <Textarea
                    id='problems_solved'
                    name='problems_solved'
                    value={form.problems_solved}
                    onChange={handleChange}
                    ref={refs.problems_solved}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('problems_solved') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('problems_solved') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='delivery_information'
                    className='mb-1 block text-sm font-medium'
                  >
                    Delivery Information <span className='text-red-500'>*</span>
                  </label>
                  <Textarea
                    id='delivery_information'
                    name='delivery_information'
                    value={form.delivery_information}
                    onChange={handleChange}
                    ref={refs.delivery_information}
                    required
                    className={`focus:ring-primary focus:ring-2 ${fieldHasError('delivery_information') ? 'border-red-500' : ''}`}
                  />
                  {fieldHasError('delivery_information') && (
                    <span className='text-xs text-red-500'>Required</span>
                  )}
                </div>
              </div>

              {/* FAQ Section */}
              <div className='mt-6 flex flex-col'>
                <label htmlFor='faq' className='mb-1 block text-sm font-medium'>
                  FAQ (Frequently Asked Questions)
                </label>
                <Textarea
                  id='faq'
                  name='faq'
                  value={form.faq}
                  onChange={handleChange}
                  ref={refs.faq}
                  className='focus:ring-primary focus:ring-2'
                  placeholder='Enter FAQ content here (optional)'
                  rows={4}
                />
              </div>

              {/* Other Relevant URLs Section */}
              <div className='mt-6'>
                <div className='mb-4'>
                  <label className='block text-sm font-medium'>
                    Other Relevant URLs
                  </label>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Add links to bonus content, support pages, terms, etc.
                    (optional)
                  </p>
                </div>
                <div ref={refs.other_relevant_urls} className='space-y-4'>
                  {form.other_relevant_urls.map((urlObj, idx) => (
                    <Card key={idx} className='bg-muted/30 border'>
                      <CardHeader className='pb-4'>
                        <CardTitle className='text-base'>
                          URL {idx + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <label
                              htmlFor={`url_title_${idx}`}
                              className='text-sm font-medium'
                            >
                              Page Title <span className='text-red-500'>*</span>
                            </label>
                            <Input
                              id={`url_title_${idx}`}
                              name={`url_title_${idx}`}
                              value={urlObj.page_title}
                              onChange={(e) =>
                                handleOtherUrlChange(
                                  idx,
                                  'page_title',
                                  e.target.value
                                )
                              }
                              className='focus:ring-primary focus:ring-2'
                              placeholder='e.g., Bonus Materials'
                            />
                          </div>
                          <div className='space-y-2'>
                            <label
                              htmlFor={`url_link_${idx}`}
                              className='text-sm font-medium'
                            >
                              URL <span className='text-red-500'>*</span>
                            </label>
                            <Input
                              id={`url_link_${idx}`}
                              name={`url_link_${idx}`}
                              value={urlObj.url}
                              onChange={(e) =>
                                handleOtherUrlChange(idx, 'url', e.target.value)
                              }
                              className='focus:ring-primary focus:ring-2'
                              placeholder='https://example.com/bonus'
                            />
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <label
                            htmlFor={`url_description_${idx}`}
                            className='text-sm font-medium'
                          >
                            Description
                          </label>
                          <Textarea
                            id={`url_description_${idx}`}
                            name={`url_description_${idx}`}
                            value={urlObj.description}
                            onChange={(e) =>
                              handleOtherUrlChange(
                                idx,
                                'description',
                                e.target.value
                              )
                            }
                            className='focus:ring-primary focus:ring-2'
                            placeholder='Brief description of this URL (optional)'
                            rows={2}
                          />
                        </div>
                        <div className='flex justify-end pt-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeOtherUrl(idx)}
                            className='text-destructive hover:text-destructive'
                          >
                            Remove URL
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type='button'
                    onClick={addOtherUrl}
                    variant='outline'
                    className='w-full'
                  >
                    + Add New URL
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value='sales'>
              {/* Sales details fields with improved card-based layout */}
              <div className='space-y-6'>
                {/* Payment Methods Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Payment Methods <span className='text-red-500'>*</span>
                    </CardTitle>
                    <CardDescription>
                      Select the payment methods available for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`space-y-3 ${fieldHasError('payment_methods') ? 'rounded-md border border-red-500 p-4' : ''}`}
                    >
                      {PAYMENT_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className='flex items-center space-x-3'
                        >
                          <input
                            id={`payment_method_${option.value}`}
                            type='checkbox'
                            value={option.value}
                            checked={safePaymentMethods.includes(option.value)}
                            onChange={handleChange}
                            className='text-primary focus:ring-primary h-4 w-4 rounded border-gray-300'
                          />
                          <label
                            htmlFor={`payment_method_${option.value}`}
                            className='text-sm font-medium'
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {fieldHasError('payment_methods') && (
                      <div className='mt-3 text-xs text-red-500'>
                        At least one Payment Method is required
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sales Offers Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Sales Offers <span className='text-red-500'>*</span>
                    </CardTitle>
                    <CardDescription>
                      Configure pricing plans and sales offers for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={refs.offers}
                      className={`space-y-4 ${fieldHasError('offers') ? 'rounded-md border border-red-500 p-4' : ''}`}
                    >
                      {form.offers.map((offer, idx) => (
                        <Card key={idx} className='bg-muted/30 border'>
                          <CardHeader className='pb-4'>
                            <CardTitle className='text-base'>
                              Offer {idx + 1}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                              <div className='space-y-2'>
                                <label
                                  htmlFor={`offer_title_${idx}`}
                                  className='text-sm font-medium'
                                >
                                  Title <span className='text-red-500'>*</span>
                                </label>
                                <Input
                                  id={`offer_title_${idx}`}
                                  name={`offer_title_${idx}`}
                                  value={offer.title}
                                  onChange={(e) =>
                                    handleOfferChange(
                                      idx,
                                      'title',
                                      e.target.value
                                    )
                                  }
                                  required
                                  className='focus:ring-primary focus:ring-2'
                                  placeholder='e.g., Basic Plan'
                                />
                              </div>
                              <div className='space-y-2'>
                                <label
                                  htmlFor={`offer_price_${idx}`}
                                  className='text-sm font-medium'
                                >
                                  Price <span className='text-red-500'>*</span>
                                </label>
                                <Input
                                  id={`offer_price_${idx}`}
                                  name={`offer_price_${idx}`}
                                  value={offer.price}
                                  onChange={(e) =>
                                    handleOfferChange(
                                      idx,
                                      'price',
                                      e.target.value
                                    )
                                  }
                                  required
                                  className='focus:ring-primary focus:ring-2'
                                  placeholder='e.g., $99.00'
                                />
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <label
                                htmlFor={`offer_description_${idx}`}
                                className='text-sm font-medium'
                              >
                                Description
                              </label>
                              <Textarea
                                id={`offer_description_${idx}`}
                                name={`offer_description_${idx}`}
                                value={offer.description}
                                onChange={(e) =>
                                  handleOfferChange(
                                    idx,
                                    'description',
                                    e.target.value
                                  )
                                }
                                className='focus:ring-primary focus:ring-2'
                                placeholder='e.g., Complete course with 50+ lessons and bonus materials'
                                rows={3}
                              />
                            </div>
                            <div className='space-y-2'>
                              <label
                                htmlFor={`offer_url_${idx}`}
                                className='text-sm font-medium'
                              >
                                Payment Page URL{' '}
                                <span className='text-red-500'>*</span>
                              </label>
                              <Input
                                id={`offer_url_${idx}`}
                                name={`offer_url_${idx}`}
                                value={offer.url}
                                onChange={(e) =>
                                  handleOfferChange(idx, 'url', e.target.value)
                                }
                                required
                                className='focus:ring-primary focus:ring-2'
                                placeholder='https://checkout.example.com/offer-1'
                              />
                            </div>
                            <div className='flex justify-end pt-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => removeOffer(idx)}
                                className='text-destructive hover:text-destructive'
                              >
                                Remove Offer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        type='button'
                        onClick={addOffer}
                        variant='outline'
                        className='w-full'
                      >
                        + Add New Offer
                      </Button>
                    </div>
                    {fieldHasError('offers') && (
                      <div className='mt-3 text-xs text-red-500'>
                        At least one Offer is required
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Discount Coupons Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Discount Coupons</CardTitle>
                    <CardDescription>
                      Create discount coupons to boost sales and customer
                      acquisition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div ref={refs.coupons} className='space-y-4'>
                      {form.coupons.length > 0 && (
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          {form.coupons.map((coupon, idx) => (
                            <Card key={idx} className='bg-muted/30 border'>
                              <CardHeader className='pb-4'>
                                <CardTitle className='text-base'>
                                  Coupon {idx + 1}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                  <label
                                    htmlFor={`coupon_title_${idx}`}
                                    className='text-sm font-medium'
                                  >
                                    Title
                                  </label>
                                  <Input
                                    id={`coupon_title_${idx}`}
                                    name={`coupon_title_${idx}`}
                                    value={coupon.title}
                                    onChange={(e) =>
                                      handleCouponChange(
                                        idx,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                    className='focus:ring-primary focus:ring-2'
                                    placeholder='e.g., Early Bird Special'
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <label
                                    htmlFor={`coupon_discount_${idx}`}
                                    className='text-sm font-medium'
                                  >
                                    Discount Value
                                  </label>
                                  <Input
                                    id={`coupon_discount_${idx}`}
                                    name={`coupon_discount_${idx}`}
                                    value={coupon.discount}
                                    onChange={(e) =>
                                      handleCouponChange(
                                        idx,
                                        'discount',
                                        e.target.value
                                      )
                                    }
                                    className='focus:ring-primary focus:ring-2'
                                    placeholder='e.g., 20% or $50'
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <label
                                    htmlFor={`coupon_code_${idx}`}
                                    className='text-sm font-medium'
                                  >
                                    Coupon Code
                                  </label>
                                  <Input
                                    id={`coupon_code_${idx}`}
                                    name={`coupon_code_${idx}`}
                                    value={coupon.code}
                                    onChange={(e) =>
                                      handleCouponChange(
                                        idx,
                                        'code',
                                        e.target.value
                                      )
                                    }
                                    className='focus:ring-primary focus:ring-2'
                                    placeholder='e.g., SAVE20'
                                  />
                                </div>
                                <div className='flex justify-end pt-2'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => removeCoupon(idx)}
                                    className='text-destructive hover:text-destructive'
                                  >
                                    Remove Coupon
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      <Button
                        type='button'
                        onClick={addCoupon}
                        variant='outline'
                        className='w-full'
                      >
                        + Add New Coupon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value='integrations'>
              {/* Integrations fields */}
              <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-2'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='platform'
                    className='mb-1 block text-sm font-medium'
                  >
                    Platform <span className='text-red-500'>*</span>
                  </label>
                  <select
                    id='platform'
                    name='platform'
                    value={form.platform}
                    onChange={handleSelectChange}
                    ref={refs.platform}
                    className={`bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-base focus:ring-2 ${fieldHasError('platform') ? 'border-red-500' : ''}`}
                    required
                    disabled={!!initialData?.id} // desabilita edição se já cadastrado
                  >
                    <option value=''>Select a platform</option>
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldHasError('platform') && (
                    <div className='mt-1 text-xs text-red-500'>Required</div>
                  )}
                </div>
                {webhookKey && (
                  <div className='flex flex-col'>
                    <label className='mb-1 block text-sm font-medium'>
                      Webhook URL
                    </label>
                    <div className='flex items-center gap-2'>
                      <Input
                        value={`https://webhook.agentpay.com.br/webhook/b3b7cd9b-f318-4a40-9265-7ef2a4714734/platform/${webhookKey}`}
                        readOnly
                        className='cursor-pointer pr-24 select-all'
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `https://webhook.agentpay.com.br/webhook/b3b7cd9b-f318-4a40-9265-7ef2a4714734/platform/${webhookKey}`
                          );
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `https://webhook.agentpay.com.br/webhook/b3b7cd9b-f318-4a40-9265-7ef2a4714734/platform/${webhookKey}`
                          );
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* --- BOTÕES DE AÇÃO --- */}
      <div className='mt-8 flex justify-end gap-4'>
        {isDirty && (
          <Button
            type='submit'
            className='w-full md:w-auto'
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving...'
              : initialData?.id
                ? 'Save Changes'
                : 'Create Product'}
          </Button>
        )}
        {/* Remove Product button - only show for existing products */}
        {initialData?.id && (
          <Button
            type='button'
            variant='destructive'
            onClick={() => setShowRemoveDialog(true)}
            className='w-full md:w-auto'
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove Product'}
          </Button>
        )}
        <Button
          variant='outline'
          onClick={() => setShowCancelDialog(true)}
          className='w-full md:w-auto'
        >
          Cancel
        </Button>
      </div>
      {/* --- FIM BOTÕES DE AÇÃO --- */}

      {/* Webhook URL modal */}
      <Dialog
        open={showWebhookModal}
        onOpenChange={(open) => {
          setShowWebhookModal(open);
          if (!open) {
            router.push('/dashboard/product');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Your Webhook</DialogTitle>
          </DialogHeader>
          <div className='mb-4 text-sm'>
            Copy and configure this webhook URL in your platform to receive
            notifications:
          </div>
          <Input
            value={webhookModalUrl || ''}
            readOnly
            className='cursor-pointer pr-24 select-all'
            onClick={async () => {
              if (webhookModalUrl) {
                await navigator.clipboard.writeText(webhookModalUrl);
                setWebhookModalCopied(true);
                setTimeout(() => setWebhookModalCopied(false), 2000);
              }
            }}
            title='Click to copy webhook URL'
          />
          {webhookModalCopied && (
            <div className='bg-primary animate-fade-in absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded px-2 py-1 text-xs text-white shadow'>
              Webhook URL copied!
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setShowWebhookModal(false);
                router.push('/dashboard/product');
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation error modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Errors</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            <p className='text-muted-foreground mb-4 text-sm'>
              Please fix the following required fields before submitting:
            </p>
            {Object.entries(groupValidationErrors(validationErrors)).map(
              ([section, errs]) =>
                errs.length > 0 && (
                  <div key={section} className='mb-2'>
                    <div className='mb-1 text-base font-semibold'>
                      {section}
                    </div>
                    <ul className='ml-6 list-disc'>
                      {errs.map((error, idx) => (
                        <li key={idx} className='text-red-500'>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowValidationModal(false);
                setTimeout(() => {
                  focusFirstValidationError();
                }, 0);
              }}
              className='w-full md:w-auto'
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            <p className='text-muted-foreground text-sm'>
              Are you sure you want to discard your changes? This action cannot
              be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowCancelDialog(false)}
              className='w-full md:w-auto'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCancelDialog(false);
                router.push('/dashboard/product');
              }}
              className='w-full md:w-auto'
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove product confirmation dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Product?</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            <p className='text-muted-foreground text-sm'>
              Are you sure you want to remove this product? This will set the
              product status to &quot;removed&quot; and it will no longer appear
              in your product listings. This action cannot be undone.
            </p>
            {saveError && (
              <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-3'>
                <p className='text-sm text-red-600'>{saveError}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowRemoveDialog(false);
                setSaveError(null);
              }}
              className='w-full md:w-auto'
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleRemoveProduct}
              className='w-full md:w-auto'
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
