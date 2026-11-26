import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const deploymentStatusSchema = z.enum([
  "PENDING_ACCEPTANCE",
  "DEPLOYED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
])

export type DeploymentStatus = z.infer<typeof deploymentStatusSchema>

export const deploymentStudentSchema = z.object({
  id: z.string(),
  studentNumber: z.string(),
  yearLevel: z.number(),
  departmentId: z.string(),
  programId: z.string(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
})

export const deploymentCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const deploymentInternshipSchema = z.object({
  id: z.string(),
  title: z.string(),
})

export const deploymentSupervisorSchema = z.object({
  id: z.string(),
  position: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
})

export const deploymentSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  studentProfileId: z.string(),
  companyId: z.string(),
  internshipId: z.string(),
  supervisorId: z.string(),
  departmentId: z.string(),
  deployedById: z.string().nullable(),
  status: deploymentStatusSchema,
  startDate: z.string(),
  endDate: z.string().nullable(),
  requiredHours: z.number(),
  completedHours: z.number(),
  acceptedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  studentProfile: deploymentStudentSchema,
  company: deploymentCompanySchema,
  internship: deploymentInternshipSchema,
  supervisor: deploymentSupervisorSchema,
})

export type Deployment = z.infer<typeof deploymentSchema>

export const createDeploymentSchema = z.object({
  applicationId: z.string().uuid("Select an approved application."),
  supervisorId: z.string().uuid("Select a supervisor."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
})

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>

export const cancelDeploymentSchema = z.object({
  cancelledReason: z.string().trim().min(3, "Enter a reason of at least 3 characters.").max(500, "Reason cannot exceed 500 characters."),
})

export type CancelDeploymentInput = z.infer<typeof cancelDeploymentSchema>

export interface DeploymentEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

/**
 * Dean-side deployment calls. Every method returns response.data — the
 * backend envelope — so callers own message handling and error toasts.
 */
export const deploymentService = {
  list: async (status?: DeploymentStatus) => {
    const response = await axiosInstance.get<DeploymentEnvelope<{ deployments: Deployment[] }>>(
      "/api/deployments/v1",
      status ? { params: { status } } : undefined,
    )
    return response.data
  },

  get: async (deploymentId: string) => {
    const response = await axiosInstance.get<DeploymentEnvelope<{ deployment: Deployment }>>(
      `/api/deployments/v1/${deploymentId}`,
    )
    return response.data
  },

  create: async (input: CreateDeploymentInput) => {
    const response = await axiosInstance.post<DeploymentEnvelope<{ deployment: Deployment }>>(
      "/api/deployments/v1",
      input,
    )
    return response.data
  },

  cancel: async (deploymentId: string, input: CancelDeploymentInput) => {
    const response = await axiosInstance.patch<DeploymentEnvelope<{ deployment: Deployment }>>(
      `/api/deployments/v1/${deploymentId}/cancel`,
      input,
    )
    return response.data
  },
}
