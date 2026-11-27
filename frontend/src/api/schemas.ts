import { z } from 'zod'

// One set of rules for the forms and for the mock API, so the client and "server" never disagree.
export const MIN_PASSWORD = 12
const email = z.string().trim().email('Enter an email address, like mai@northwind.example.')

export const loginSchema = z.object({
  email: z.string().trim().email('Enter your email address, like mai@northwind.example.'),
  password: z.string().min(1, 'Enter your password.'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name so teammates know who you are.').max(60, 'Use 60 characters or fewer.'),
  email,
  password: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`),
})
export type SignupInput = z.infer<typeof signupSchema>

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(60, 'Use 60 characters or fewer.'),
  email,
})
export type ProfileInput = z.infer<typeof profileSchema>

export const workspaceNameSchema = z.string().trim().min(1, 'A workspace needs a name').max(40)
export const prefixSchema = z.string().regex(/^[A-Z0-9]{2,5}$/, 'A prefix needs 2 to 5 letters or digits')
export const taskTitleSchema = z.string().trim().min(1).max(140)
export const commentSchema = z.string().trim().min(1).max(2000)
export const inviteSchema = z.object({
  email: z.string().trim().email('Enter an email address to invite'),
  role: z.enum(['Member', 'Admin']),
})
