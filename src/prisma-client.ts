import { PrismaClient } from '@prisma/client'

let prismaClient: PrismaClient;

const prisma = (): PrismaClient => {
  if (prismaClient) {
    return prismaClient
  } else {
    prismaClient = new PrismaClient()
    return prismaClient
  }
}

export default prisma;