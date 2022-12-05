import prismaClient from '../prisma-client';
import { tryCatch } from '../utils';

const prisma = prismaClient();

const logger =  {
  info: (info: any) => console.error('[user controller]', info),
  log: (log: any) => console.error('[user controller]', log),
  error: (err: any) => console.error('[user controller]', err),
};

export default {
  create: {
    user: tryCatch(async (data: any) => {
      const user = await prisma.user.create({
        data,
      });

      return user;
    }),
  },
  read: {
    users: tryCatch(async () => {
      return await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          deposit: true,
          role: true,
        },
      });
    }, logger),
    userById: tryCatch(async (id: number, withPassword: boolean = false) => {
      return await prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          deposit: true,
          role: true,
          password: withPassword,
        },
        where: {
          id,
        },
      });
    }, logger),
    userByUsername: tryCatch(async (username: string, withPassword: boolean = false) => {
      return await prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          deposit: true,
          role: true,
          password: withPassword,
        },
        where: {
          username,
        },
      });
    }, logger)
  },
  update: {
    userById: tryCatch(async (id: number, data: any, withPassword: boolean = false) => {
      return await prisma.user.update({
        select: {
          id: true,
          username: true,
          deposit: true,
          role: true,
          password: withPassword,
        },
        where: {
          id,
        },
        data,
      });
    }, logger),
    userByUsername: tryCatch(async (username: string, data: any, withPassword: boolean = false) => {
      return await prisma.user.update({
        select: {
          id: true,
          username: true,
          deposit: true,
          role: true,
          password: withPassword,
        },
        where: {
          username,
        },
        data,
      });
    }),
  },
  delete: {
    userById: tryCatch(async (id: number) => {
      return await prisma.user.delete({
        where: {
          id,
        },
      });
    }),
    userByUsername: tryCatch(async (username: string) => {
      return await prisma.user.delete({
        where: {
          username,
        },
      });
    }),
  },
};

