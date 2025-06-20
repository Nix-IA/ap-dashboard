import * as z from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(6, { message: 'New password must be at least 6 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least: 1 uppercase, 1 lowercase and 1 number'
      ),
    confirmPassword: z
      .string()
      .min(1, { message: 'Password confirmation is required' })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword']
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
