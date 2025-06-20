import * as z from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  landing_page: z.string().url('Main Page URL must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  objective: z.string().min(1, 'Objective is required'),
  benefits: z.string().min(1, 'Benefits are required'),
  target_audience: z.string().min(1, 'Target Audience is required'),
  problems_solved: z.string().min(1, 'Problems Solved is required'),
  delivery_information: z.string().min(1, 'Delivery information is required'),
  payment_methods: z
    .array(z.string())
    .min(1, 'At least one Payment Method is required'),
  faq: z.string().optional(),
  offers: z
    .array(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        price: z.string().min(1, 'Price is required'),
        url: z.string().url('Offer Page URL must be a valid URL')
      })
    )
    .min(1, 'At least one Offer is required'),
  coupons: z.array(
    z.object({
      title: z.string().optional(),
      discount: z.string().optional(),
      code: z.string().optional()
    })
  ),
  other_relevant_urls: z.array(
    z.object({
      page_title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      url: z.string().url('Valid URL is required')
    })
  ),
  platform: z.string().min(1, 'Platform is required'),
  webhook: z.string().optional(),
  status: z.string().optional()
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
