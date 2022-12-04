import { Router, Request, Response } from 'express';
import prisma from '../prisma-client';
import { createToken } from '../utils';

const router = Router();

router.post('/login', async function (req: Request, res: Response) {
  // Get the username and password from the request body.
  const { username, password } = req.body;

  // Check if the username and password are the same as in DB.
  const user = await prisma().user.findUnique({
    where: {
      username,
    },
  });

  // Check if the username and password are valid.
  if (username === user?.username && password === user?.password) {
    const token = createToken({ username });

    // Return the JWT in the response.
    res.status(200).json({ token });
  } else {
    // If the credentials are not valid, return a 401 Unauthorized response.
    res.status(401).send({ error: "Unauthorized" });
  }
});

export default router;