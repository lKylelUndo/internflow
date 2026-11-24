import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AccountStatus, RoleType } from '@/generated/prisma/client';

// ============================================================
// InternFlow seed — idempotent (safe to run repeatedly).
//
// Seeds:
//   1. Departments: College of Computer Studies, BSHM, Education
//   2. Programs:    CCS → BSIT; BSHM → BSHM; Education → BSED English,
//                   BSED Science, BEED
//   3. Root ADMIN account (verifies deans / manages the platform)
//
// Admin credentials come from .env (SEED_ADMIN_*), with dev fallbacks.
// ============================================================

type SeedProgram = { code: string; name: string };
type SeedDepartment = { code: string; name: string; programs: SeedProgram[] };

const DEPARTMENTS: SeedDepartment[] = [
  {
    code: 'CCS',
    name: 'College of Computer Studies',
    programs: [{ code: 'BSIT', name: 'BS Information Technology' }],
  },
  {
    code: 'BSHM',
    name: 'BSHM',
    programs: [{ code: 'BSHM', name: 'BS Hospitality Management' }],
  },
  {
    code: 'EDUC',
    name: 'Education',
    programs: [
      { code: 'BSED-ENG', name: 'BSED English' },
      { code: 'BSED-SCI', name: 'BSED Science' },
      { code: 'BEED', name: 'BEED' },
    ],
  },
];

const DEFAULT_ADMIN_PASSWORD = 'Admin@12345';

const seedAcademicStructure = async () => {
  for (const dept of DEPARTMENTS) {
    const department = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: { code: dept.code, name: dept.name },
    });

    for (const program of dept.programs) {
      await prisma.program.upsert({
        where: {
          departmentId_code: { departmentId: department.id, code: program.code },
        },
        update: { name: program.name },
        create: {
          departmentId: department.id,
          code: program.code,
          name: program.name,
        },
      });
    }

    console.log(
      `  ✓ ${department.name} — ${dept.programs.length} program${dept.programs.length > 1 ? 's' : ''}`,
    );
  }
};

const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@internflow.local';
  const password = process.env.SEED_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (process.env.NODE_ENV === 'production' && password === DEFAULT_ADMIN_PASSWORD) {
    throw new Error(
      'Refusing to seed the default admin password in production. Set SEED_ADMIN_PASSWORD.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: RoleType.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      verifiedAt: new Date(),
    },
    create: {
      email,
      password: passwordHash,
      firstName: process.env.SEED_ADMIN_FIRST_NAME || 'System',
      lastName: process.env.SEED_ADMIN_LAST_NAME || 'Administrator',
      role: RoleType.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      verifiedAt: new Date(),
    },
  });

  console.log(`  ✓ Admin account — ${admin.email}`);

  if (password === DEFAULT_ADMIN_PASSWORD) {
    console.warn('  ⚠ Using the default dev password — change it before production.');
  }
};

const main = async () => {
  console.log('Seeding InternFlow...');

  console.log('Departments & programs:');
  await seedAcademicStructure();

  console.log('Accounts:');
  await seedAdmin();

  console.log('Seed complete.');
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
