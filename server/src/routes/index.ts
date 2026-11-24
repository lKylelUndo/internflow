import { Router } from 'express';
import authRoutes from '@/routes/auth.routes';
import academicRoutes from '@/routes/academic.routes';
import adminRoutes from '@/routes/admin.routes';
import companyRoutes from '@/routes/company.routes';
import supervisorRoutes from '@/routes/supervisor.routes';
import ojtRequirementRoutes from '@/routes/ojt-requirement.routes';
import internshipRoutes from '@/routes/internship.routes';
import applicationRoutes from '@/routes/application.routes';
import deploymentRoutes from '@/routes/deployment.routes';
import attendanceRoutes from '@/routes/attendance.routes';
import reportRoutes from '@/routes/report.routes';
import evaluationRoutes from '@/routes/evaluation.routes';
import studentRoutes from '@/routes/student.routes';

const router = Router();

router.use('/auth/v1', authRoutes);
router.use('/academic/v1', academicRoutes);
router.use('/admin/v1', adminRoutes);
router.use('/companies/v1', companyRoutes);
router.use('/supervisors/v1', supervisorRoutes);
router.use('/ojt-requirements/v1', ojtRequirementRoutes);
router.use('/internships/v1', internshipRoutes);
router.use('/applications/v1', applicationRoutes);
router.use('/deployments/v1', deploymentRoutes);
router.use('/attendance/v1', attendanceRoutes);
router.use('/reports/v1', reportRoutes);
router.use('/evaluations/v1', evaluationRoutes);
router.use('/students/v1', studentRoutes);

export default router;
