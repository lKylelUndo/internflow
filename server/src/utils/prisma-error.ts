import { Prisma } from '@/generated/prisma/client';

type PrismaErrorMeta = {
  target?: unknown;
  driverAdapterError?: {
    cause?: {
      constraint?: {
        index?: string;
      };
    };
  };
};

/**
 * Prisma 7's driver adapter reports P2002 constraint names under
 * `meta.driverAdapterError.cause.constraint.index` instead of `meta.target`.
 * Return both so callers can reliably tell which unique field collided.
 */
export const getUniqueConstraintFields = (error: Prisma.PrismaClientKnownRequestError): string => {
  const meta = error.meta as PrismaErrorMeta | undefined;
  const target = meta?.target;
  const targetFields = Array.isArray(target) ? target.join(',') : String(target ?? '');
  const adapterConstraint = meta?.driverAdapterError?.cause?.constraint?.index ?? '';

  return `${targetFields},${adapterConstraint}`;
};
