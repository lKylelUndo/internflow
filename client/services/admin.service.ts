import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const deanProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  departmentId: z.string(),
  position: z.string().nullable(),
  department: departmentSchema,
})

export const accountStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
])

export type AccountStatus = z.infer<typeof accountStatusSchema>

export const safeDeanSchema = z.object({
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
  deanProfile: deanProfileSchema.nullable(),
})

export type SafeDean = z.infer<typeof safeDeanSchema>

export interface AdminEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

/**
 * Admin dean administration calls. Every method returns response.data — the
 * backend envelope — so callers own message handling and error toasts.
 */
export const adminService = {
  listDeans: async (status: AccountStatus) => {
    const response = await axiosInstance.get<AdminEnvelope<{ deans: SafeDean[] }>>(
      "/api/admin/v1/deans",
      { params: { status } },
    )
    return response.data
  },

  verifyDean: async (userId: string) => {
    const response = await axiosInstance.patch<AdminEnvelope<{ user: SafeDean }>>(
      `/api/admin/v1/deans/${userId}/verify`,
    )
    return response.data
  },

  suspendDean: async (userId: string) => {
    const response = await axiosInstance.patch<AdminEnvelope<{ user: SafeDean }>>(
      `/api/admin/v1/deans/${userId}/suspend`,
    )
    return response.data
  },
}
