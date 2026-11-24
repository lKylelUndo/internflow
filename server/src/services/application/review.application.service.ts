import { ApplicationStatus } from '@/generated/prisma/client';
import { findApplicationById, reviewApplication } from '@/repositories/application.repository';
import { findSupervisorProfileByUserId } from '@/repositories/supervisor.repository';
import type { ApplicationData, ReviewApplicationInput } from '@/types/application';
import type { ServiceResponse } from '@/types/api';

export const reviewApplicationService = {
  execute: async (
    supervisorUserId: string,
    applicationId: string,
    input: ReviewApplicationInput,
  ): Promise<ServiceResponse<ApplicationData>> => {
    try {
      const profile = await findSupervisorProfileByUserId(supervisorUserId);
      if (!profile) {
        return { status: 'error', code: 403, message: 'Supervisor profile not found' };
      }

      const application = await findApplicationById(applicationId);
      if (!application || application.internship.company.id !== profile.companyId) {
        return { status: 'error', code: 404, message: 'Application not found' };
      }
      if (application.status !== ApplicationStatus.PENDING) {
        return { status: 'error', code: 409, message: 'Only pending applications can be reviewed' };
      }

      const status = input.status === 'REJECTED' ? ApplicationStatus.REJECTED : ApplicationStatus.APPROVED;
      const rejectionReason = status === ApplicationStatus.REJECTED ? (input.rejectionReason ?? null) : null;
      const updated = await reviewApplication(applicationId, status, rejectionReason, supervisorUserId);

      return {
        status: 'success',
        code: 200,
        message: status === ApplicationStatus.REJECTED
          ? 'Application rejected successfully'
          : 'Application approved successfully',
        data: { application: updated },
      };
    } catch (error) {
      console.error('reviewApplicationService', error);
      return { status: 'error', code: 500, message: 'Failed to review application' };
    }
  },
};
