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
    product: tryCatch(async (data: any, user) => {
      return await prisma.product.create({
        data: {
          productName: data.productName,
          cost: Number(data.cost),
          amountAvailable: Number(data.amountAvailable),
          seller: {
            connect: {
              id: Number(user?.id), // sets product.sellerId to user.id
            },
          },
        },
      });
    }, logger),
  },
  read: {
    productById: tryCatch(async (id: number) => {
      return await prisma.product.findUniqueOrThrow({
        where: {
          id,
        },
      });
    }, logger),
    allBySellerId: tryCatch(async (id: number) => {
      return await prisma.product.findMany({
        where: {
          sellerId: Number(id),
        },
      });
    }, logger),
  },
  update: {
    productById: tryCatch(async (id: number, data: any) => {
      return await prisma.product.update({
        where: {
          id,
        },
        data,
      });
    }, logger),
  },
  delete: {
    productById: tryCatch(async (id: number) => {
      return await prisma.product.delete({
        where: {
          id: Number(id),
        },
      });
    }, logger),
  },
};

