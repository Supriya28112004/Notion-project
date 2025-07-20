import { z } from 'zod'
export const signupschema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email({message:'Invalid Email'}),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmpassword: z.string(),
  acceptterms: z.literal(true), 
}).refine((data) => data.password === data.confirmpassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})


export const loginschema = z.object({
  email: z.string().email({message:'Invalid email'}),
  password: z.string().min(6, 'Password is required'),
})

