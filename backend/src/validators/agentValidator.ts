import { z } from 'zod';

export const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

export const createAgentSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(phoneRegex, 'Please enter a valid phone number'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  serviceArea: z
    .string({ required_error: 'Service area is required' })
    .trim()
    .min(2, 'Service area must be at least 2 characters')
    .max(100, 'Service area cannot exceed 100 characters'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'], {
      errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
    })
    .default('ACTIVE'),
  vehicleType: z.string().trim().max(50).optional().nullable(),
  vehicleNumber: z.string().trim().max(50).optional().nullable(),
});

export const updateAgentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase()
    .optional(),
  serviceArea: z
    .string()
    .trim()
    .min(2, 'Service area must be at least 2 characters')
    .max(100, 'Service area cannot exceed 100 characters')
    .optional(),
  status: z
    .enum(['ACTIVE', 'INACTIVE'], {
      errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
    })
    .optional(),
  vehicleType: z.string().trim().max(50).optional().nullable(),
  vehicleNumber: z.string().trim().max(50).optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
  }),
});

export const queryAgentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['fullName', 'createdAt', 'serviceArea', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const agentIdParamSchema = z.object({
  id: z.string().uuid('Agent ID must be a valid UUID'),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type QueryAgentsInput = z.infer<typeof queryAgentsSchema>;
