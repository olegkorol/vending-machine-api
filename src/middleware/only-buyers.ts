import { NextFunction, Request, Response } from 'express';

import prisma from '../prisma-client';

export async function onlyBuyers(req: Request | any, res: Response, next: NextFunction) {
  // Get data passed down by the `withAuth` middleware
  const { user: { username } } = req.jwt;

  try {
    const user = await prisma().user.findUniqueOrThrow({
      where: {
        username,
      },
    })
    if (user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only sellers are allowed to manage products' });
    }
    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export default onlyBuyers;
