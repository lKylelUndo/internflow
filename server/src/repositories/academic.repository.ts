import { prisma } from '@/lib/prisma';

export const findDepartmentById = (departmentId: string) =>
  prisma.department.findUnique({ where: { id: departmentId } });

export const findAllDepartmentsWithPrograms = () =>
  prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { programs: { orderBy: { name: 'asc' } } },
  });
