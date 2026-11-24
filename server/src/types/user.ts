export type CreateStudentWithProfileInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  studentNumber: string;
  yearLevel: number;
  departmentId: string;
  programId: string;
};

export type CreateDeanWithProfileInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  departmentId: string;
};

export type CreateSupervisorWithProfileInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  companyId: string;
  position?: string;
};
