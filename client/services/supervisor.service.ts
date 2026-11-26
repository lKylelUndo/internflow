import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const accountStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
])

export type AccountStatus = z.infer<typeof accountStatusSchema>

export const safeSupervisorUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  contactNumber: z.string().nullable(),
  role: z.string(),
  accountStatus: accountStatusSchema,
  verifiedAt: z.string().nullable(),
  verifiedById: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const supervisorCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  contactEmail: z.string().nullable(),
  contactNumber: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  departmentId: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const safeSupervisorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyId: z.string(),
  position: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: safeSupervisorUserSchema,
  company: supervisorCompanySchema,
})

export type SafeSupervisor = z.infer<typeof safeSupervisorSchema>

export interface SupervisorEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

/**
 * Dean-side supervisor administration calls. Every method returns
 * response.data — the backend envelope — so callers own messages and toasts.
 */
export const supervisorService = {
  list: async (status: AccountStatus) => {
    const response = await axiosInstance.get<SupervisorEnvelope<{ supervisors: SafeSupervisor[] }>>(
      "/api/supervisors/v1",
      { params: { status } },
    )
    return response.data
  },

  verify: async (userId: string) => {
    const response = await axiosInstance.patch<SupervisorEnvelope<{ supervisor: SafeSupervisor }>>(
      `/api/supervisors/v1/${userId}/verify`,
    )
    return response.data
  },

  suspend: async (userId: string) => {
    const response = await axiosInstance.patch<SupervisorEnvelope<{ supervisor: SafeSupervisor }>>(
      `/api/supervisors/v1/${userId}/suspend`,
    )
    return response.data
  },
}
