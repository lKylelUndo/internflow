import { AccountStatus, ApplicationStatus, Prisma } from '@/generated/prisma/client';
import { findApplicationById } from '@/repositories/application.repository';
import { createDeployment, findActiveDeploymentByStudent, findDeploymentByApplicationId } from '@/repositories/deployment.repository';
import { findRequirementByDepartmentAndProgram } from '@/repositories/ojt-requirement.repository';
import { findSupervisorProfileById } from '@/repositories/supervisor.repository';
import { findDeanProfileByUserId } from '@/repositories/user.repository';
import type { CreateDeploymentInput, DeploymentData } from '@/types/deployment';
import type { ServiceResponse } from '@/types/api';

const normalizeDate = (value: Date | undefined): Date | null => {
  if (value === undefined) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const createDeploymentService = {
  execute: async (deanUserId: string, input: CreateDeploymentInput): Promise<ServiceResponse<DeploymentData>> => {
    try {
      const dean = await findDeanProfileByUserId(deanUserId);
      if (!dean) {
        return { status: 'error', code: 403, message: 'Dean profile not found' };
      }

      const application = await findApplicationById(input.applicationId);
      if (!application || application.internship.company.departmentId !== dean.departmentId) {
        return { status: 'error', code: 404, message: 'Application not found' };
      }
      if (application.status !== ApplicationStatus.APPROVED) {
        return { status: 'error', code: 400, message: 'Application must be approved before deployment' };
      }

      const deployed = await findDeploymentByApplicationId(input.applicationId);
      if (deployed) {
        return { status: 'error', code: 409, message: 'This application has already been deployed' };
      }

      const active = await findActiveDeploymentByStudent(application.studentProfile.id);
      if (active) {
        return { status: 'error', code: 409, message: 'Student already has an active deployment' };
      }

      const supervisor = await findSupervisorProfileById(input.supervisorId);
      if (!supervisor) {
        return { status: 'error', code: 404, message: 'Supervisor not found' };
      }
      if (supervisor.companyId !== application.internship.company.id) {
        return { status: 'error', code: 400, message: 'Supervisor does not belong to this company' };
      }
      if (supervisor.user.accountStatus !== AccountStatus.ACTIVE) {
        return { status: 'error', code: 400, message: 'Supervisor account is not active' };
      }

      const student = application.studentProfile;
      const programRequirement = await findRequirementByDepartmentAndProgram(student.departmentId, student.programId);
      const fallback = programRequirement?.isActive
        ? programRequirement
        : await findRequirementByDepartmentAndProgram(student.departmentId, null);
      const requirement = fallback?.isActive ? fallback : null;
      if (!requirement) {
        return { status: 'error', code: 400, message: 'No active OJT requirement configured for this program' };
      }

      const startDate = normalizeDate(input.startDate);
      if (!startDate) {
        return { status: 'error', code: 400, message: 'Invalid start date' };
      }
      const endDate = input.endDate === undefined ? null : normalizeDate(input.endDate);
      if (input.endDate !== undefined && !endDate) {
        return { status: 'error', code: 400, message: 'Invalid end date' };
      }
      if (endDate && endDate < startDate) {
        return { status: 'error', code: 400, message: 'End date must be on or after start date' };
      }

      const deployment = await createDeployment({
        applicationId: application.id,
        studentProfileId: application.studentProfileId,
        companyId: application.internship.company.id,
        internshipId: application.internshipId,
        supervisorId: supervisor.id,
        departmentId: dean.departmentId,
        deployedById: deanUserId,
        requiredHours: requirement.requiredHours,
        startDate,
        ...(endDate && { endDate }),
      });

      return {
        status: 'success',
        code: 201,
        message: 'Deployment created successfully',
        data: { deployment },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'error', code: 409, message: 'Student already has an active deployment' };
      }

      console.error('createDeploymentService', error);
      return { status: 'error', code: 500, message: 'Failed to create deployment' };
    }
  },
};
