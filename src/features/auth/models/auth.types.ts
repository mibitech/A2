import { z } from 'zod'

// ===== SCHEMAS ZOD =====

export const signUpSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().optional(),
  tipoPessoa: z.enum(['fisica', 'juridica']).default('fisica'),
  cpfCnpj: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export const signInSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// ===== TYPES =====

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export interface AuthUser {
  id: string
  email: string
  nomeCompleto: string | null
  telefone: string | null
  cpfCnpj: string | null
  tipoPessoa: 'fisica' | 'juridica'
  role: 'cliente' | 'funcionario' | 'admin'
  createdAt: string
}

export interface AuthState {
  user: AuthUser | null
  session: {
    accessToken: string
    refreshToken: string
  } | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthError {
  message: string
  code?: string
}
