import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  description: z.string(),
})

export type Company = z.infer<typeof companySchema>

export interface CompaniesEnvelope {
  status: "success" | "error"
  code: number
  message: string
  data: { companies: Company[] }
  path?: string
  errors?: { path: string; message: string }[]
}

export const companyDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  departmentId: z.string(),
  address: z.string(),
  contactEmail: z.string().nullable(),
  contactNumber: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CompanyDetail = z.infer<typeof companyDetailSchema>

export const companyWithCountsSchema = companyDetailSchema.extend({
  _count: z.object({
    supervisors: z.number(),
    internships: z.number(),
  }),
})

export type CompanyWithCounts = z.infer<typeof companyWithCountsSchema>

export interface CompanyEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

export const companyFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a company name of at least 2 characters."),
  address: z.string().trim().min(5, "Enter an address of at least 5 characters."),
  contactEmail: z.string().refine(
    (value) => value.trim() === "" || z.email().safeParse(value.trim()).success,
    "Enter a valid email address.",
  ),
  contactNumber: z.string(),
  website: z.string().refine(
    (value) => value.trim() === "" || z.url().safeParse(value.trim()).success,
    "Enter a valid URL including https://.",
  ),
  description: z.string(),
  isActive: z.boolean(),
})

export type CompanyFormInput = z.infer<typeof companyFormSchema>

export interface CompanyCreateInput {
  name: string
  address: string
  contactEmail?: string
  contactNumber?: string
  website?: string
  description?: string
  logoUrl?: string
}

export interface CompanyUpdateInput extends Partial<CompanyCreateInput> {
  isActive?: boolean
}

export const companyService = {
  getPublicCompanies: async (departmentId?: string) => {
    const url = departmentId
      ? `/api/companies/v1/public?departmentId=${departmentId}`
      : "/api/companies/v1/public"
    const response = await axiosInstance.get<CompaniesEnvelope>(url)
    return response.data
  },

  listCompanies: async () => {
    const response = await axiosInstance.get<CompanyEnvelope<{ companies: CompanyWithCounts[] }>>(
      "/api/companies/v1",
    )
    return response.data
  },

  createCompany: async (input: CompanyCreateInput) => {
    const response = await axiosInstance.post<CompanyEnvelope<{ company: CompanyDetail }>>(
      "/api/companies/v1",
      input,
    )
    return response.data
  },

  getCompany: async (companyId: string) => {
    const response = await axiosInstance.get<CompanyEnvelope<{ company: CompanyDetail }>>(
      `/api/companies/v1/${companyId}`,
    )
    return response.data
  },

  updateCompany: async (companyId: string, input: CompanyUpdateInput) => {
    const response = await axiosInstance.patch<CompanyEnvelope<{ company: CompanyDetail }>>(
      `/api/companies/v1/${companyId}`,
      input,
    )
    return response.data
  },
}
