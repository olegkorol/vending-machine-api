import { Router, Request, Response } from 'express';
import { User } from '../interfaces/User';
import prisma from '../prisma-client';

const router = Router();

// Deposit a single coin into the user's vending machine account
router.post('/deposit', async (req: Request | any, res: Response) => {
  const { coin } = req.body;
  const { user: { username } } = req.jwt;

  if (!coin) {
    return res.status(400).json('please provide a coin');
  }

  const user = await prisma().user.findUnique({
    where: {
      username,
    },
  }) as User;

  const { role } = user;

  if (role !== 'buyer') {
    return res.status(400).json({message: 'sellers cannot deposit coins!' });
  }

  const validCoinValues = [5, 10, 20, 50, 100];
  if (!validCoinValues.includes(req.body.coin)) {
    return res.status(400).json({message: 'invalid coin! - allowed: [5, 10, 20, 50, 100] cents' });
  }

  const deposit = user.deposit + coin;
  
  const update = await prisma().user.update({
    select: {
      username: true,
      deposit: true,
      role: true,
    },
    where: {
      username,
    },
    data: {
      deposit,
    },
  });

  res.status(200).json({ message: 'Coin deposited!', user: update });
});


// Buy a single product with the money deposited in the user's vending machine account
router.post('/buy/:productId', async (req: Request | any, res: Response) => {
  const { user : { username } } = req.jwt;
  const { productId } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({message: 'Please provide an amount for the product you want to purchase' });
  }

  try {
    const user = await prisma().user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  
    const product = await prisma().product.findUniqueOrThrow({
      where: {
        id: Number(productId),
      },
    });

    // Check if there is enough stock for the order
    if (product.amountAvailable < amount) {
      return res.status(400).json({
        message: 'Not enough products available!', 
        requestedAmount: amount, 
        availableAmount: product.amountAvailable,
      });
    }
  
    // Check if the user has enough money to buy the product
    const totalPrice = amount * product.cost; // in cents
  
    if (totalPrice > user.deposit) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
  
    // Calculate the user's change (if any)
    let change = user.deposit - totalPrice;
  
    let changeCoins: number[] = [];
    if (change > 0) {
    // Calculate the change in 5, 10, 20, 50, and 100 cent coins
    const validCoinValues = [100, 50, 20, 10, 5];
    validCoinValues.forEach(coin => {
        while (coin <= change) {
          changeCoins.push(coin);
          change -= coin;
        }
      });
    }
  
    // Update the user's vending machine account balance and save it to the database
    const newDeposit = user.deposit - totalPrice;
  
    const updatedUser = await prisma().user.update({
      where: {
        username,
      },
      data: {
        deposit: newDeposit,
      },
    });

    // Update product's stock
    const updatedProduct = await prisma().product.update({
      where: {
        id: Number(product.id),
      },
      data: {
        amountAvailable: Number(product.amountAvailable - amount),
      }
    });
  
    res.status(200).json({
      message: 'Purchase successful!',
      product: product.productName,
      totalPrice,
      changeCoins,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Reset the user's vending machine account balance to 0
router.post('/reset', async (req: Request | any, res: Response) => {
  const { user: { username } } = req.jwt;

  try {
    // get user's current balance (deposit)
    const user = await prisma().user.findUniqueOrThrow({
      where: {
        username,
      },
    }) as User;
  
    const { deposit } = user;
  
    if (deposit === 0) {
      return res.status(200).send('Your account balance is already 0');
    }
  
    const update = await prisma().user.update({
      where: {
        username,
      },
      data: {
        deposit: 0,
      },
    });
  
    res.status(200).json({update, returnChange: deposit});
  } catch (err: any) {
    res.status(400).json({message: err.message});
  }
});

export default router;