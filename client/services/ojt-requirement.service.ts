import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const programSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  departmentId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ojtRequirementSchema = z.object({
  id: z.string().uuid(),
  departmentId: z.string().uuid(),
  programId: z.string().uuid().nullable(),
  requiredHours: z.number().int().min(1).max(2000),
  requiredDocuments: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  program: programSchema.nullable(),
})

export type OjtRequirement = z.infer<typeof ojtRequirementSchema>

export interface OjtRequirementEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

export const createOjtRequirementSchema = z.object({
  requiredHours: z.number().int().min(1, "Enter required hours between 1 and 2000.").max(2000, "Required hours cannot exceed 2000."),
  requiredDocuments: z.array(z.string().trim().min(1).max(200)).max(20, "Add at most 20 documents."),
  programId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
})

export type CreateOjtRequirementInput = z.infer<typeof createOjtRequirementSchema>

export const updateOjtRequirementSchema = z.object({
  requiredHours: z.number().int().min(1, "Enter required hours between 1 and 2000.").max(2000, "Required hours cannot exceed 2000.").optional(),
  requiredDocuments: z.array(z.string().trim().min(1).max(200)).max(20, "Add at most 20 documents.").optional(),
  programId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateOjtRequirementInput = z.infer<typeof updateOjtRequirementSchema>

/**
 * Dean-side OJT requirement calls. Every method returns response.data — the
 * backend envelope — so callers own message handling and error toasts.
 */
export const ojtRequirementService = {
  list: async () => {
    const response = await axiosInstance.get<OjtRequirementEnvelope<{ requirements: OjtRequirement[] }>>(
      "/api/ojt-requirements/v1",
    )
    return response.data
  },

  create: async (input: CreateOjtRequirementInput) => {
    const response = await axiosInstance.post<OjtRequirementEnvelope<{ requirement: OjtRequirement }>>(
      "/api/ojt-requirements/v1",
      input,
    )
    return response.data
  },

  get: async (requirementId: string) => {
    const response = await axiosInstance.get<OjtRequirementEnvelope<{ requirement: OjtRequirement }>>(
      `/api/ojt-requirements/v1/${requirementId}`,
    )
    return response.data
  },

  update: async (requirementId: string, input: UpdateOjtRequirementInput) => {
    const response = await axiosInstance.patch<OjtRequirementEnvelope<{ requirement: OjtRequirement }>>(
      `/api/ojt-requirements/v1/${requirementId}`,
      input,
    )
    return response.data
  },
}
