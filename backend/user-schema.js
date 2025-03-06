import z from 'zod'

const Schema = z.object({
  username: z.string({
    invalid_type_error: 'Username must be a string'
  }).min(3).max(75),
  password: z.string({
    invalid_type_error: 'Password must be a string'
  }).min(8)
})

const productSchema = z.object({
  adminId: z.string({
    invalid_type_error: 'Admin ID must be a string',
    required_error: 'This space is required'
  }),
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'This space is required'
  }),
  price: z.number({
    invalid_type_error: 'Price must be a number',
    required_error: 'This space is required'
  }),
  urlImg: z.string({
    invalid_type_error: 'URL Image must be a string',
    required_error: 'This space is required'
  }),
  description: z.string({
    invalid_type_error: 'URL Image must be a string',
    required_error: 'This space is required'
  }),
  stock: z.number({
    invalid_type_error: 'Stock must be a number',
    required_error: 'This space is required'
  }).min(1)
})

export function parseUser (object) {
  return Schema.safeParse(object)
}

export function parseProduct (object) {
  return productSchema.safeParse(object)
}
