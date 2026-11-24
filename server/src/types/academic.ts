import type { Department, Program } from '@/generated/prisma/client';

export type DepartmentWithPrograms = Department & { programs: Program[] };
export type DepartmentsData = { departments: DepartmentWithPrograms[] };
