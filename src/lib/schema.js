import { z } from 'zod';

export const orderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+251|0)?[79]\d{8}$/, {
      message: 'Invalid phone number (must be valid Ethiopian format, e.g. 0912345678 or +251912345678)',
    }),
  items: z.array(z.any()).optional(),
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
