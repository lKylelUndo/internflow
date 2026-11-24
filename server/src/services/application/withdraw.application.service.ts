import { ApplicationStatus } from '@/generated/prisma/client';
import { findApplicationById, withdrawApplication } from '@/repositories/application.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ApplicationData } from '@/types/application';
import type { ServiceResponse } from '@/types/api';

export const withdrawApplicationService = {
  execute: async (studentUserId: string, applicationId: string): Promise<ServiceResponse<ApplicationData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }

      const application = await findApplicationById(applicationId);
      if (!application || application.studentProfileId !== student.id) {
        return { status: 'error', code: 404, message: 'Application not found' };
      }
      if (application.status !== ApplicationStatus.PENDING) {
        return { status: 'error', code: 409, message: 'Only pending applications can be withdrawn' };
      }

      const updated = await withdrawApplication(applicationId);

      return {
        status: 'success',
        code: 200,
        message: 'Application withdrawn successfully',
        data: { application: updated },
      };
    } catch (error) {
      console.error('withdrawApplicationService', error);
      return { status: 'error', code: 500, message: 'Failed to withdraw application' };
    }
  },
};
