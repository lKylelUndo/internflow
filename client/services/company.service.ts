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

export const companyService = {
  getPublicCompanies: async (departmentId?: string) => {
    const url = departmentId
      ? `/api/companies/v1/public?departmentId=${departmentId}`
      : "/api/companies/v1/public"
    const response = await axiosInstance.get<CompaniesEnvelope>(url)
    return response.data
  },
}
