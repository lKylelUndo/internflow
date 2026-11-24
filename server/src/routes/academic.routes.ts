import { Router } from 'express';
import academicController from '@/controllers/academic.controller';

const academicRoutes = Router();

academicRoutes.get('/departments', academicController.getDepartments);

export default academicRoutes;
