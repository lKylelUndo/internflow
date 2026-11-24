import { z } from "zod"

import { axiosInstance } from "@/lib/axios"

export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  programs: z.array(z.object({ id: z.string().uuid(), name: z.string() })),
})

export type Department = z.infer<typeof departmentSchema>

export interface DepartmentsEnvelope {
  status: "success" | "error"
  code: number
  message: string
  data: { departments: Department[] }
  path?: string
  errors?: { path: string; message: string }[]
}

export const academicService = {
  getDepartments: async () => {
    const response = await axiosInstance.get<DepartmentsEnvelope>(
      "/api/academic/v1/departments",
    )
    return response.data
  },
}
