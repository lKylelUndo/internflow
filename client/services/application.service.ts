import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const applicationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
])

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>

export const applicationStudentSchema = z.object({
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

export const applicationSchema = z.object({
  id: z.string(),
  status: applicationStatusSchema,
  internshipId: z.string(),
  studentProfileId: z.string(),
  coverLetter: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  reviewedById: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  internship: z.object({
    id: z.string(),
    title: z.string(),
    company: z.object({
      id: z.string(),
      name: z.string(),
      departmentId: z.string(),
    }),
  }),
  studentProfile: applicationStudentSchema,
})

export type Application = z.infer<typeof applicationSchema>

export interface ApplicationEnvelope<T = unknown> {
  status: "success" | "error"
  code: number
  message: string
  data?: T
  path?: string
  errors?: { path: string; message: string }[]
}

/** Minimal read-only application calls used by the dean deployment screen. */
export const applicationService = {
  listApproved: async () => {
    const response = await axiosInstance.get<ApplicationEnvelope<{ applications: Application[] }>>(
      "/api/applications/v1",
      { params: { status: "APPROVED" } },
    )
    return response.data
  },

  get: async (applicationId: string) => {
    const response = await axiosInstance.get<ApplicationEnvelope<{ application: Application }>>(
      `/api/applications/v1/${applicationId}`,
    )
    return response.data
  },
}
