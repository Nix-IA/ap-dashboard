'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
export function mapProductSchemaToForm(data: any): typeof DEFAULT_PRODUCT {
  if (!data) return { ...DEFAULT_PRODUCT };
  return {
    status: 'inactive',
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
    faq: Array.isArray(data.sales_info?.sales_support?.faq)
      ? data.sales_info.sales_support.faq
          .map((f: any) => `${f.question}\n${f.answer}`)
          .join('\n\n')
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
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add a ref for the description field
  const descriptionRef = useRef<HTMLDivElement>(null);
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
    platform: useRef<HTMLDivElement>(null),
    delivery_information: useRef<HTMLTextAreaElement>(null),
    other_relevant_urls: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    if (onboarding) {
      try {
        const data = localStorage.getItem('agentpay_product_onboarding');
        if (data) setOnboardingData(JSON.parse(data));
      } catch {}
    }
  }, [onboarding]);

  useEffect(() => {
    // Prefill form with onboarding data ou initialData
    if (onboardingData) {
      setForm(mapProductSchemaToForm(onboardingData));
      setInitialForm(mapProductSchemaToForm(onboardingData));
    } else if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
      setInitialForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [onboardingData, initialData]);

  useEffect(() => {
    // Carrega knowledge_base do sessionStorage se existir
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem('agentpay_product_edit');
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          setForm(parsed);
          setInitialForm(parsed);
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
    if (
      form.other_relevant_urls.some(
        (u) => !u.page_title?.trim() || !u.url?.trim() || !isValidUrl(u.url)
      )
    ) {
      errors.push(
        'Other Relevant URLs: title and valid URL are required for each entry'
      );
    }
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
      status: form.status || 'inactive'
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
          landing_page_url: form.landing_page,
          image_url: ''
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
          faq: form.faq ? JSON.parse(form.faq) : [],
          other_relevant_urls: form.other_relevant_urls
        }
      }
    };
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { product_id, knowledge_base_id } =
        await saveProductToSupabase(productJson);
      setIsSaving(false);
      setSaveSuccess(true);
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

  // Mapeamento campo -> aba
  const fieldTabMap: Record<string, string> = {
    name: 'product',
    landing_page: 'product',
    description: 'product',
    objective: 'product',
    benefits: 'product',
    target_audience: 'product',
    problems_solved: 'product',
    payment_methods: 'sales',
    offers: 'sales',
    platform: 'integrations'
  };

  // Ao fechar o modal, scroll/foco no primeiro campo faltante
  useEffect(() => {
    if (
      !showValidationModal &&
      submitAttempted &&
      validationErrors.length > 0
    ) {
      // Mapear o nome do campo pelo texto do erro
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showValidationModal]);

  // Handlers for other_relevant_urls
  const handleOtherUrlChange = (idx: number, field: string, value: string) => {
    setForm((prev) => {
      const urls = [...(prev.other_relevant_urls || [])];
      urls[idx] = { ...urls[idx], [field]: value };
      return { ...prev, other_relevant_urls: urls };
    });
  };
  const addOtherUrl = () =>
    setForm((prev) => ({
      ...prev,
      other_relevant_urls: [
        ...(prev.other_relevant_urls || []),
        { page_title: '', description: '', url: '' }
      ]
    }));
  const removeOtherUrl = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      other_relevant_urls: prev.other_relevant_urls.filter((_, i) => i !== idx)
    }));

  // Helper for other_relevant_urls validation
  const otherUrlFieldErrors = submitAttempted
    ? form.other_relevant_urls.map((urlObj) => ({
        page_title: !urlObj.page_title?.trim(),
        url: !urlObj.url?.trim() || !isValidUrl(urlObj.url)
      }))
    : form.other_relevant_urls.map(() => ({ page_title: false, url: false }));
  const isOtherUrlMissing =
    submitAttempted &&
    (!form.other_relevant_urls ||
      form.other_relevant_urls.length === 0 ||
      form.other_relevant_urls.some(
        (u) => !u.page_title?.trim() || !u.url?.trim() || !isValidUrl(u.url)
      ));

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/dashboard/product');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    router.push('/dashboard/product');
  };

  return (
    <form onSubmit={handleSubmit} className='mx-auto max-w-3xl'>
      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
        </CardHeader>
        <CardContent className='max-h-[80vh] overflow-y-auto'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='mb-4'>
              <TabsTrigger value='product'>Product</TabsTrigger>
              <TabsTrigger value='sales'>Sales</TabsTrigger>
              <TabsTrigger value='integrations'>Integrations</TabsTrigger>
            </TabsList>
            <TabsContent value='product'>
              {/* Product Section */}
              <section className='space-y-6'>
                <div>
                  <label className='mb-1 block font-medium'>
                    Name{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Input
                    ref={refs.name}
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                    placeholder='Product name'
                    className={
                      submitAttempted && !form.name.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                    autoComplete='off'
                  />
                  {submitAttempted && !form.name.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Name is required.
                    </div>
                  )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Main Page{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Input
                    ref={refs.landing_page}
                    name='landing_page'
                    value={form.landing_page}
                    onChange={handleChange}
                    placeholder='Paste here...'
                    className={
                      submitAttempted &&
                      (!form.landing_page.trim() ||
                        !isValidUrl(form.landing_page.trim()))
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                  />
                  {submitAttempted && !form.landing_page.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Main Page URL is required.
                    </div>
                  )}
                  {submitAttempted &&
                    form.landing_page.trim() &&
                    !isValidUrl(form.landing_page.trim()) && (
                      <div className='text-destructive mt-1 text-xs'>
                        Enter a valid URL (starting with http:// or https://).
                      </div>
                    )}
                </div>
                <div className='mt-2'>
                  <label className='mb-1 block font-medium'>
                    Description{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <div
                    ref={descriptionRef}
                    contentEditable
                    suppressContentEditableWarning
                    className='bg-background focus:ring-primary min-h-[100px] rounded-md border p-2 focus:ring-2 focus:outline-none'
                    style={{
                      whiteSpace: 'pre-wrap',
                      backgroundColor: 'inherit'
                    }}
                    onBlur={handleDescriptionBlur}
                    dangerouslySetInnerHTML={{ __html: form.description }}
                    aria-label='Product description (rich text allowed)'
                  />
                  <div className='text-muted-foreground mt-1 text-xs'>
                    You can use formatting (bullets, bold, etc). Pasting from
                    Word/Google Docs will preserve formatting.
                  </div>
                  {submitAttempted &&
                    (!form.description.trim() ||
                      form.description === '<br>') && (
                      <div className='text-destructive mt-1 text-xs'>
                        Description is required.
                      </div>
                    )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Objective{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Textarea
                    ref={refs.objective}
                    name='objective'
                    value={form.objective}
                    onChange={handleChange}
                    placeholder='Type here...'
                    rows={2}
                    className={
                      submitAttempted && !form.objective.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                  />
                  {submitAttempted && !form.objective.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Objective is required.
                    </div>
                  )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Benefits{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Textarea
                    ref={refs.benefits}
                    name='benefits'
                    value={form.benefits}
                    onChange={handleChange}
                    placeholder='Type here...'
                    rows={2}
                    className={
                      submitAttempted && !form.benefits.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                  />
                  {submitAttempted && !form.benefits.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Benefits are required.
                    </div>
                  )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Target Audience{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Textarea
                    ref={refs.target_audience}
                    name='target_audience'
                    value={form.target_audience}
                    onChange={handleChange}
                    placeholder='Type here...'
                    rows={2}
                    className={
                      submitAttempted && !form.target_audience.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                  />
                  {submitAttempted && !form.target_audience.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Target Audience is required.
                    </div>
                  )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Problems Solved{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Textarea
                    ref={refs.problems_solved}
                    name='problems_solved'
                    value={form.problems_solved}
                    onChange={handleChange}
                    placeholder='Type here...'
                    rows={2}
                    className={
                      submitAttempted && !form.problems_solved.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                  />
                  {submitAttempted && !form.problems_solved.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Problems Solved is required.
                    </div>
                  )}
                </div>
                <div>
                  <label className='mb-1 block font-medium'>
                    Delivery Information{' '}
                    <span className='text-destructive' title='Required'>
                      *
                    </span>
                  </label>
                  <Textarea
                    ref={refs.delivery_information}
                    name='delivery_information'
                    value={form.delivery_information}
                    onChange={handleChange}
                    placeholder='Describe what and how the customer will receive after purchase.'
                    className={
                      submitAttempted && !form.delivery_information.trim()
                        ? 'border-destructive focus:ring-destructive'
                        : undefined
                    }
                    rows={2}
                  />
                  {submitAttempted && !form.delivery_information.trim() && (
                    <div className='text-destructive mt-1 text-xs'>
                      Delivery information is required.
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>
            <TabsContent value='sales'>
              {/* Sales Section */}
              <section className='space-y-6'>
                <div className='mb-6'>
                  <label className='mb-1 block font-medium'>
                    Payment Methods
                  </label>
                  <div
                    className={`flex gap-4${isPaymentMissing ? 'border-destructive rounded-md border p-2' : ''}`}
                  >
                    {PAYMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className='flex items-center gap-1'
                      >
                        <input
                          type='checkbox'
                          name='payment_methods'
                          value={opt.value}
                          checked={form.payment_methods.includes(opt.value)}
                          onChange={handleChange}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {isPaymentMissing && (
                    <div className='text-destructive mt-1 text-xs'>
                      At least one Payment Method is required.
                    </div>
                  )}
                </div>
                <div className='mb-6'>
                  <label className='mb-1 block font-medium'>FAQ</label>
                  <Textarea
                    name='faq'
                    value={form.faq}
                    onChange={handleChange}
                    placeholder='Describe the most frequent questions'
                    rows={2}
                  />
                  <div className='text-muted-foreground mt-1 text-xs'>
                    Write questions and answers in Q&amp;A style. Example:
                    <br />
                    Q: How do I access the product?
                    <br />
                    A: You will receive an email with access instructions after
                    purchase.
                  </div>
                </div>
                <div className='mb-6'>
                  <label className='mb-1 block font-medium'>Offers</label>
                  <div
                    className={`mb-6${isOfferMissing ? 'border-destructive rounded-md border p-2' : ''}`}
                  >
                    {form.offers.map((offer, idx) => (
                      <Card key={idx} className='bg-muted mb-4 p-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div>
                            <label
                              className={`block text-sm font-medium mb-1${offerFieldErrors[idx]?.title ? 'text-destructive' : ''}`}
                            >
                              Title <span className='text-destructive'>*</span>
                            </label>
                            <Input
                              value={offer.title}
                              onChange={(e) =>
                                handleOfferChange(idx, 'title', e.target.value)
                              }
                              placeholder='Offer title'
                              className={
                                offerFieldErrors[idx]?.title
                                  ? 'border-destructive focus:ring-destructive'
                                  : ''
                              }
                            />
                            {offerFieldErrors[idx]?.title && (
                              <div className='text-destructive mt-1 text-xs'>
                                Title is required.
                              </div>
                            )}
                          </div>
                          <div>
                            <label
                              className={`block text-sm font-medium mb-1${offerFieldErrors[idx]?.price ? 'text-destructive' : ''}`}
                            >
                              Price <span className='text-destructive'>*</span>
                            </label>
                            <Input
                              value={offer.price}
                              onChange={(e) =>
                                handleOfferChange(idx, 'price', e.target.value)
                              }
                              placeholder='e.g. R$67, 12xR$9,90 or R$47/month'
                              className={
                                offerFieldErrors[idx]?.price
                                  ? 'border-destructive focus:ring-destructive'
                                  : ''
                              }
                            />
                            {offerFieldErrors[idx]?.price && (
                              <div className='text-destructive mt-1 text-xs'>
                                Price is required.
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='mt-2'>
                          <label className='mb-1 block text-sm font-medium'>
                            Description
                          </label>
                          <Textarea
                            value={offer.description}
                            onChange={(e) =>
                              handleOfferChange(
                                idx,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Offer description (optional)'
                            rows={2}
                          />
                        </div>
                        <div className={`mt-2`}>
                          <label
                            className={`block text-sm font-medium mb-1${offerFieldErrors[idx]?.url || (submitAttempted && offer.url && !isValidUrl(offer.url)) ? 'text-destructive' : ''}`}
                          >
                            Offer Page{' '}
                            <span className='text-destructive'>*</span>
                          </label>
                          <Input
                            value={offer.url}
                            onChange={(e) =>
                              handleOfferChange(idx, 'url', e.target.value)
                            }
                            placeholder='Offer URL'
                            className={
                              offerFieldErrors[idx]?.url ||
                              (submitAttempted &&
                                offer.url &&
                                !isValidUrl(offer.url))
                                ? 'border-destructive focus:ring-destructive'
                                : ''
                            }
                          />
                          {offerFieldErrors[idx]?.url && (
                            <div className='text-destructive mt-1 text-xs'>
                              Offer Page URL is required.
                            </div>
                          )}
                          {submitAttempted &&
                            offer.url &&
                            !isValidUrl(offer.url) && (
                              <div className='text-destructive mt-1 text-xs'>
                                Enter a valid URL (starting with http:// or
                                https://).
                              </div>
                            )}
                        </div>
                        {form.offers.length > 1 && (
                          <Button
                            type='button'
                            variant='destructive'
                            className='mt-2'
                            onClick={() => setShowRemoveOffer(idx)}
                          >
                            Remove
                          </Button>
                        )}
                        <Dialog
                          open={showRemoveOffer === idx}
                          onOpenChange={() => setShowRemoveOffer(null)}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove offer?</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to remove this offer?</p>
                            <DialogFooter>
                              <Button
                                variant='outline'
                                onClick={() => setShowRemoveOffer(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant='destructive'
                                onClick={() => {
                                  removeOffer(idx);
                                  setShowRemoveOffer(null);
                                }}
                              >
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </Card>
                    ))}
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={addOffer}
                      className='w-full'
                    >
                      + Add
                    </Button>
                    {isOfferMissing && (
                      <div className='text-destructive mt-1 text-xs'>
                        At least one Offer is required.
                      </div>
                    )}
                  </div>
                </div>
                <div className='mb-6'>
                  <label className='mb-1 block font-medium'>Coupons</label>
                  {form.coupons.map((coupon, idx) => (
                    <Card key={idx} className='bg-muted mb-4 p-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div>
                          <label className='block text-sm'>Title</label>
                          <Input
                            value={coupon.title}
                            onChange={(e) =>
                              handleCouponChange(idx, 'title', e.target.value)
                            }
                            placeholder='Coupon title'
                          />
                        </div>
                        <div>
                          <label className='block text-sm'>Discount</label>
                          <Input
                            value={coupon.discount}
                            onChange={(e) =>
                              handleCouponChange(
                                idx,
                                'discount',
                                e.target.value
                              )
                            }
                            placeholder='e.g. 20%'
                          />
                        </div>
                        <div>
                          <label className='block text-sm'>Code</label>
                          <Input
                            value={coupon.code}
                            onChange={(e) =>
                              handleCouponChange(idx, 'code', e.target.value)
                            }
                            placeholder='e.g. LAN20'
                          />
                        </div>
                      </div>
                      {form.coupons.length > 1 && (
                        <Button
                          type='button'
                          variant='destructive'
                          className='mt-2'
                          onClick={() => setShowRemoveCoupon(idx)}
                        >
                          Remove
                        </Button>
                      )}
                      <Dialog
                        open={showRemoveCoupon === idx}
                        onOpenChange={() => setShowRemoveCoupon(null)}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove coupon?</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to remove this coupon?</p>
                          <DialogFooter>
                            <Button
                              variant='outline'
                              onClick={() => setShowRemoveCoupon(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='destructive'
                              onClick={() => {
                                removeCoupon(idx);
                                setShowRemoveCoupon(null);
                              }}
                            >
                              Remove
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ))}
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={addCoupon}
                    className='w-full'
                  >
                    + Add
                  </Button>
                </div>
                <div className='mb-6'>
                  <label className='mb-1 block font-medium'>
                    Other Relevant URLs
                  </label>
                  {form.other_relevant_urls.map((urlObj, idx) => (
                    <Card key={idx} className='bg-muted mb-2 p-3'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1${otherUrlFieldErrors[idx]?.page_title ? 'text-destructive' : ''}`}
                          >
                            Title <span className='text-destructive'>*</span>
                          </label>
                          <Input
                            value={urlObj.page_title || ''}
                            onChange={(e) =>
                              handleOtherUrlChange(
                                idx,
                                'page_title',
                                e.target.value
                              )
                            }
                            placeholder='e.g. Terms of Service'
                            className={
                              otherUrlFieldErrors[idx]?.page_title
                                ? 'border-destructive focus:ring-destructive'
                                : ''
                            }
                          />
                          {otherUrlFieldErrors[idx]?.page_title && (
                            <div className='text-destructive mt-1 text-xs'>
                              Title is required.
                            </div>
                          )}
                        </div>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1${otherUrlFieldErrors[idx]?.url ? 'text-destructive' : ''}`}
                          >
                            URL <span className='text-destructive'>*</span>
                          </label>
                          <Input
                            value={urlObj.url || ''}
                            onChange={(e) =>
                              handleOtherUrlChange(idx, 'url', e.target.value)
                            }
                            placeholder='https://...'
                            className={
                              otherUrlFieldErrors[idx]?.url
                                ? 'border-destructive focus:ring-destructive'
                                : ''
                            }
                          />
                          {otherUrlFieldErrors[idx]?.url && (
                            <div className='text-destructive mt-1 text-xs'>
                              Valid URL is required.
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='mt-2'>
                        <label className='mb-1 block text-sm font-medium'>
                          Description
                        </label>
                        <Textarea
                          value={urlObj.description || ''}
                          onChange={(e) =>
                            handleOtherUrlChange(
                              idx,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder='e.g. Terms and conditions for buyers.'
                          rows={2}
                        />
                      </div>
                      {form.other_relevant_urls.length > 1 && (
                        <Button
                          type='button'
                          variant='destructive'
                          className='mt-2'
                          onClick={() => setShowRemoveOtherUrl(idx)}
                        >
                          Remove
                        </Button>
                      )}
                      <Dialog
                        open={showRemoveOtherUrl === idx}
                        onOpenChange={() => setShowRemoveOtherUrl(null)}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove URL?</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to remove this URL?</p>
                          <DialogFooter>
                            <Button
                              variant='outline'
                              onClick={() => setShowRemoveOtherUrl(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='destructive'
                              onClick={() => {
                                removeOtherUrl(idx);
                                setShowRemoveOtherUrl(null);
                              }}
                            >
                              Remove
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ))}
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={addOtherUrl}
                    className='w-full'
                  >
                    + Add
                  </Button>
                  {isOtherUrlMissing && (
                    <div className='text-destructive mt-1 text-xs'>
                      Each entry must have a title and a valid URL.
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>
            <TabsContent value='integrations'>
              {/* Integrations Section */}
              <section className='space-y-6'>
                <div className='flex flex-col gap-6'>
                  <div>
                    <label className='mb-1 block font-medium'>
                      Platform{' '}
                      <span className='text-destructive' title='Required'>
                        *
                      </span>
                    </label>
                    <div
                      className={`mb-6${isPlatformMissing ? 'border-destructive rounded-md border p-2' : ''}`}
                    >
                      <div className='flex gap-4'>
                        <label className='flex items-center gap-1'>
                          <input
                            type='radio'
                            name='platform'
                            value=''
                            checked={form.platform === ''}
                            onChange={handleChange}
                            disabled
                            className='opacity-50'
                          />
                          <span className='text-muted-foreground'>
                            Select a platform
                          </span>
                        </label>
                        {PLATFORM_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className='flex items-center gap-1'
                          >
                            <input
                              type='radio'
                              name='platform'
                              value={opt.value}
                              checked={form.platform === opt.value}
                              onChange={handleChange}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                      {form.platform && (
                        <div className='mt-2 text-xs text-amber-600'>
                          After saving, the selected platform cannot be changed.
                        </div>
                      )}
                      {isPlatformMissing && (
                        <div className='text-destructive mt-1 text-xs'>
                          Platform is required.
                        </div>
                      )}
                    </div>
                  </div>
                  {showWebhook && (
                    <div className='relative'>
                      <label className='mb-1 block font-medium'>Webhook</label>
                      <Input
                        ref={webhookInputRef}
                        name='webhook'
                        value={form.webhook}
                        readOnly
                        className='cursor-pointer pr-24 select-all'
                        onClick={async () => {
                          if (form.webhook) {
                            await navigator.clipboard.writeText(form.webhook);
                            setWebhookCopied(true);
                            setTimeout(() => setWebhookCopied(false), 2000);
                          }
                        }}
                        title='Click to copy webhook URL'
                      />
                      {webhookCopied && (
                        <div className='bg-primary animate-fade-in absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded px-2 py-1 text-xs text-white shadow'>
                          Webhook URL copied!
                        </div>
                      )}
                      <div className='text-muted-foreground mt-1 text-xs'>
                        Click to copy the webhook URL to your clipboard.
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>
          </Tabs>
          <div className='mt-8 flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='default'
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type='submit' size='default'>
              Save Product
            </Button>
          </div>
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Discard changes?</DialogTitle>
              </DialogHeader>
              <div className='mb-4'>
                You have unsaved changes. Are you sure you want to cancel and
                lose all changes?
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setShowCancelDialog(false)}
                >
                  No, keep editing
                </Button>
                <Button variant='destructive' onClick={confirmCancel}>
                  Yes, discard changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Validation Modal (render at root of form) */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Required Fields</DialogTitle>
          </DialogHeader>
          <ul className='text-destructive mb-4 list-disc pl-5 text-sm'>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setShowValidationModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSaving && (
        <div className='text-primary mt-2 text-sm'>Saving product...</div>
      )}
      {saveError && (
        <div className='text-destructive mt-2 text-sm'>{saveError}</div>
      )}
      {saveSuccess && (
        <div className='mt-2 text-sm text-green-600'>
          Product saved successfully!
        </div>
      )}

      <div className='text-muted-foreground mb-2 text-xs'>
        Fields marked with <span className='text-destructive'>*</span> are
        required.
      </div>
    </form>
  );
}
