import { Router, Request, Response } from 'express';
import { Product } from '../interfaces/Product';
import prisma from '../prisma-client';

const router = Router();

// Create a new product
router.post('/product', async (req: Request | any, res: Response) => {
  // Find user that is creating the product
  const { user: { username } } = req.jwt;
  const { productName, cost, amountAvailable } = req.body;

  if (!productName || !cost || !amountAvailable) {
    return res.status(400).send('productName, cost, and amountAvailable are required');
  }

  try {
    const user = await prisma().user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(400).send('user does not exist (anymore)');
    }

    const product = await prisma().product.create({
      data: {
        productName,
        cost: Number(cost),
        amountAvailable: Number(amountAvailable),
        seller: {
          connect: {
            id: Number(user?.id), // sets product.sellerId to user.id
          },
        },
      },
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a list of all products (that belong to the user making the request)
router.get('/products', async (req: Request | any, res: Response) => {
  const { user: { username } } = req.jwt;
  try {
    const user = await prisma().user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(400).send('user does not exist (anymore)');
    }

    const products = await prisma().product.findMany({
      where: {
        sellerId: user.id,
      },
    });
    res.status(200).json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product by id
router.get('/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma().product.findUnique({
      where: {
        id: Number(id),
      },
    });
  
    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product by id
router.put('/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productName, cost, amountAvailable } = req.body;

  if (!productName && !cost && !amountAvailable) {
    return res.status(400).send('at least one of productName, cost, or amountAvailable are required');
  }

  // allow for any combination of productName, cost, and amountAvailable; ignoring undefined values
  const data = {
    ...(productName && { productName }),
    ...(cost && { cost }),
    ...(amountAvailable && { amountAvailable }),
  };

  try {
    const product = await prisma().product.update({
      where: {
        id: Number(id),
      },
      data,
    });
  
    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product by id
router.delete('/product/:id', async (req: Request | any, res: Response) => {
  const { id } = req.params;
  const { user: { username } } = req.jwt;

  try {
    const user = await prisma().user.findUniqueOrThrow({
      where: {
        username,
      },
    });

    const product = await prisma().product.findUniqueOrThrow({
      where: {
        id: Number(id),
      },
    });

    if (product?.sellerId !== user?.id) {
      return res.status(403).send('you are not authorized to delete this product');
    }

    await prisma().product.delete({
      where: {
        id: Number(id),
      },
    });
  
    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.meta?.cause || err.message });
  }
});

export default router;