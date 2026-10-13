import { z } from 'zod'

export const earlyAccessSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(255, 'Email cannot exceed 255 characters')
    .transform((val) => val.trim().toLowerCase()),
  firstName: z
    .string()
    .trim()
    .max(100, 'First name cannot exceed 100 characters')
    .optional(),
  source: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default('website_waitlist_modal'),
}).strict()

export type EarlyAccessInput = z.infer<typeof earlyAccessSchema>

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must not exceed 120 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(255, 'Email cannot exceed 255 characters')
    .transform((val) => val.trim().toLowerCase()),
  category: z
    .string()
    .trim()
    .min(2, 'Inquiry category is required')
    .max(80)
    .default('General Inquiry'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must contain at least 10 characters')
    .max(4000, 'Message cannot exceed 4000 characters'),
}).strict()

export type ContactInput = z.infer<typeof contactSchema>

export const checkoutSchema = z.object({
  planId: z.enum(['free', 'pro', 'max', 'enterprise'], {
    message: 'Invalid plan identifier',
  }),
  billingInterval: z.enum(['month', 'year']).optional().default('month'),
}).strict()

export type CheckoutInput = z.infer<typeof checkoutSchema>

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root'
    formatted[path] = issue.message
  }
  return formatted
}
