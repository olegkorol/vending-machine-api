import { Router, Request, Response } from 'express';
import { User, Product } from '../interfaces';
import productController from '../controllers/product';
import userController from '../controllers/user';

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
    const user: User = await userController.read.userByUsername(username);

    if (!user) {
      return res.status(400).send('user does not exist (anymore)');
    }

    const product = await productController.create.product({
      productName,
      cost,
      amountAvailable,
    }, user);

    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a list of all products (that belong to the user making the request)
router.get('/products', async (req: Request | any, res: Response) => {
  const { user: { username } } = req.jwt;
  try {
    const user = await userController.read.userByUsername(username);

    if (!user) {
      return res.status(400).send('user does not exist (anymore)');
    }

    const products = await productController.read.allBySellerId(Number(user.id));
    res.status(200).json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product by id
router.get('/product/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await productController.read.productById(Number(id));
  
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
    const product = await productController.update.productById(Number(id), data);
  
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
    const user = await userController.read.userByUsername(username);

    const product = await productController.read.productById(Number(id));

    if (product?.sellerId !== user?.id) {
      return res.status(403).send('you are not authorized to delete this product');
    }

    await productController.delete.productById(Number(id));
  
    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.meta?.cause || err.message });
  }
});

export default router;