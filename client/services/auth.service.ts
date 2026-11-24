import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type LoginInput = z.infer<typeof loginSchema>

export const studentSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional().default(""),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  contactNumber: z.string().optional().default(""),
  studentNumber: z.string().min(1, "Student number is required."),
  yearLevel: z.coerce.number().min(1, "Select a year level.").max(6, "Invalid year level."),
  programId: z.string().uuid("Select a valid program."),
})

export type StudentSignupInput = z.infer<typeof studentSignupSchema>

export const deanSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional().default(""),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  contactNumber: z.string().optional().default(""),
  departmentId: z.string().uuid("Select a valid department."),
})

export type DeanSignupInput = z.infer<typeof deanSignupSchema>

export const supervisorSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  middleName: z.string().optional().default(""),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  contactNumber: z.string().optional().default(""),
  companyId: z.string().uuid("Select a valid company."),
  position: z.string().optional().default(""),
})

export type SupervisorSignupInput = z.infer<typeof supervisorSignupSchema>

// ---------------------------------------------------------------------------
// Entity types (mirror the GET /api/auth/v1/me user payload)
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "DEAN" | "STUDENT" | "COMPANY_SUPERVISOR"

export interface StudentProfile {
  studentNumber: string
  yearLevel: number
  eligibilityStatus: string
  program: { id: string; name: string }
  department: { id: string; name: string }
}

export interface DeanProfile {
  department: { id: string; name: string }
}

export interface SupervisorProfile {
  position: string | null
  company: { id: string; name: string }
}

export interface User {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  contactNumber: string | null
  role: UserRole
  accountStatus: string
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  studentProfile?: StudentProfile
  deanProfile?: DeanProfile
  supervisorProfile?: SupervisorProfile
}

export interface AuthEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

export interface MeResponse {
  user: User
}

// ---------------------------------------------------------------------------
// Service object. Every method returns response.data (the backend envelope).
// ---------------------------------------------------------------------------

export const authService = {
  login: async (data: LoginInput) => {
    const response = await axiosInstance.post<AuthEnvelope<{ user: User }>>(
      "/api/auth/v1/login",
      data,
    )
    return response.data
  },

  signupStudent: async (data: StudentSignupInput) => {
    const response = await axiosInstance.post<AuthEnvelope<{ user: User }>>(
      "/api/auth/v1/signup/student",
      data,
    )
    return response.data
  },

  signupDean: async (data: DeanSignupInput) => {
    const response = await axiosInstance.post<AuthEnvelope<{ user: User }>>(
      "/api/auth/v1/signup/dean",
      data,
    )
    return response.data
  },

  signupSupervisor: async (data: SupervisorSignupInput) => {
    const response = await axiosInstance.post<AuthEnvelope<{ user: User }>>(
      "/api/auth/v1/signup/supervisor",
      data,
    )
    return response.data
  },

  logout: async () => {
    const response = await axiosInstance.post<AuthEnvelope>("/api/auth/v1/logout")
    return response.data
  },

  getMe: async () => {
    const response = await axiosInstance.get<AuthEnvelope<MeResponse>>(
      "/api/auth/v1/me",
    )
    return response.data
  },
}
