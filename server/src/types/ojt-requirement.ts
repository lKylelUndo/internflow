import type { infer as ZodInfer } from 'zod';
import type { OJTRequirement as OjtRequirement, Program } from '@/generated/prisma/client';
import type { createOjtRequirementSchema, ojtRequirementIdSchema, updateOjtRequirementSchema } from '@/schemas/ojt-requirement';

export type OjtRequirementWithProgram = OjtRequirement & { program: Program | null };
export type CreateOjtRequirementInput = ZodInfer<typeof createOjtRequirementSchema>['body'];
export type UpdateOjtRequirementInput = ZodInfer<typeof updateOjtRequirementSchema>['body'];
export type OjtRequirementIdParams = ZodInfer<typeof ojtRequirementIdSchema>['params'];
export type CreateOjtRequirementRecord = {
  departmentId: string;
  programId: string | null;
  requiredHours: number;
  requiredDocuments: string[];
  isActive?: boolean;
};
export type UpdateOjtRequirementRecord = UpdateOjtRequirementInput;
export type ListOjtRequirementsData = { requirements: OjtRequirementWithProgram[] };
export type OjtRequirementData = { requirement: OjtRequirementWithProgram };
