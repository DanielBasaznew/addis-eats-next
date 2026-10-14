import { z } from 'zod';

export const orderSchema = z
  .object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters' }),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(/^(\+251|0)?[79]\d{8}$/, {
        message: 'Invalid phone number (must be valid Ethiopian format, e.g. 0912345678 or +251912345678)',
      }),
    isTableOrder: z.preprocess(
      (val) => val === true || val === 'true' || val === '1' || val === 'on',
      z.boolean()
    ).default(false),
    tableNumber: z.string().trim().optional(),
    address: z.string().trim().optional(),
    paymentMethod: z.enum(['telebirr', 'cbe', 'cash']).default('telebirr'),
    specialInstructions: z.string().trim().optional(),
    items: z.array(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    // Address is required only for delivery orders
    if (!data.isTableOrder && (!data.address || data.address.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'Delivery address/area is required for delivery orders (min 3 characters).',
      });
    }

    // Table number is required for dine-in table orders
    if (data.isTableOrder && (!data.tableNumber || !data.tableNumber.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tableNumber'],
        message: 'Table number is required for dine-in orders.',
      });
    }
  });

export const tableSchema = z.object({
  number: z.preprocess(
    (val) => (val !== undefined && val !== null ? String(val).trim() : ''),
    z.string().min(1, { message: 'Table number is required' })
  ),
  label: z
    .string()
    .trim()
    .optional()
    .default('General Dining'),
  seats: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(1, { message: 'Table must have at least 1 seat' }).default(4)
  ),
});

export const dishSchema = z.object({
  name: z
    .string({ required_error: 'Dish name is required' })
    .trim()
    .min(2, { message: 'Dish name must be at least 2 characters' }),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(2, { message: 'Category must be at least 2 characters' }),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number({ required_error: 'Price is required' }).positive({ message: 'Price must be greater than 0' })
  ),
  vegetarian: z.preprocess(
    (val) => val === true || val === 'true' || val === 'on' || val === 1 || val === '1',
    z.boolean()
  ),
  available: z.preprocess(
    (val) => (val === undefined ? true : val === true || val === 'true' || val === 'on' || val === 1 || val === '1'),
    z.boolean()
  ).default(true),
  image: z
    .string()
    .trim()
    .optional()
    .default('/images/dishes/genfo.jpg'),
  description: z
    .string()
    .trim()
    .optional(),
});

