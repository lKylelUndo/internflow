import { ApplicationStatus, EligibilityStatus } from '@/generated/prisma/client';
import { createApplication, findApplicationByStudentAndInternship, resetWithdrawnApplication } from '@/repositories/application.repository';
import { findInternshipById } from '@/repositories/internship.repository';
import { findStudentProfileByUserId } from '@/repositories/user.repository';
import type { ApplicationData, CreateApplicationInput } from '@/types/application';
import type { ServiceResponse } from '@/types/api';

export const createApplicationService = {
  execute: async (studentUserId: string, input: CreateApplicationInput): Promise<ServiceResponse<ApplicationData>> => {
    try {
      const student = await findStudentProfileByUserId(studentUserId);
      if (!student) {
        return { status: 'error', code: 403, message: 'Student profile not found' };
      }
      if (student.eligibilityStatus !== EligibilityStatus.ELIGIBLE) {
        return { status: 'error', code: 403, message: 'Student is not eligible to apply for internships' };
      }

      const internship = await findInternshipById(input.internshipId);
      if (!internship) {
        return { status: 'error', code: 404, message: 'Internship not found' };
      }

      const visible =
        internship.isOpen &&
        internship.company.isActive &&
        internship.company.departmentId === student.departmentId &&
        (internship.deadline === null || internship.deadline >= new Date());
      if (!visible) {
        return { status: 'error', code: 400, message: 'Internship is not open for applications' };
      }

      const existing = await findApplicationByStudentAndInternship(student.id, input.internshipId);
      if (existing) {
        if (existing.status === ApplicationStatus.PENDING || existing.status === ApplicationStatus.APPROVED) {
          return { status: 'error', code: 409, message: 'You have already applied to this internship' };
        }
        if (existing.status === ApplicationStatus.REJECTED) {
          return { status: 'error', code: 409, message: 'Your previous application was rejected' };
        }

        const application = await resetWithdrawnApplication(existing.id, input.coverLetter);
        return {
          status: 'success',
          code: 200,
          message: 'Application resubmitted successfully',
          data: { application },
        };
      }

      const application = await createApplication({
        studentProfileId: student.id,
        internshipId: input.internshipId,
        coverLetter: input.coverLetter,
      });

      return {
        status: 'success',
        code: 201,
        message: 'Application submitted successfully',
        data: { application },
      };
    } catch (error) {
      console.error('createApplicationService', error);
      return { status: 'error', code: 500, message: 'Failed to submit application' };
    }
  },
};
