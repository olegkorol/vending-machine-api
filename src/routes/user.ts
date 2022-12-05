import { Router, Request, Response } from 'express';
import { User } from '../interfaces';
import { withAuth } from '../middleware/with-auth';
import userController from '../controllers/user';

const router: Router = Router();

// Create a new user
router.post('/', async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).send('username and password are required');
  }

  const data: User = {
    username,
    password, // this should be hashed in a real-world app
  }
  if (role) {
    data.role = role;
  }

  try {
    const user = await userController.read.userByUsername(username);

    if (user) {
      return res.status(400).send('username already exists');
    }

    const newUser = await userController.create.user(data);

    return res.status(201).json(newUser);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single user by username
router.get('/:username', withAuth, async (req: Request | any, res: Response) => {
  const { username } = req.params;
  const { user: { username: jwtUsername }} = req.jwt;

  if (username !== jwtUsername) {
    return res.status(403).send('You are not authorized to access this resource');
  }

  try {
    const user = await userController.read.userByUsername(username);

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update a user's password and/or role by username
router.put('/:username', withAuth, async (req: Request | any, res: Response) => {
  const { password, role } = req.body;
  const { username } = req.params;
  const { user: { username: jwtUsername } } = req.jwt;

  if (username !== jwtUsername) {
    return res.status(403).json('You are not authorized to access this resource');
  }

  if (!password && !role) {
    return res.status(400).json('Either a new password or role is required');
  }
  if (role && !['buyer', 'seller'].includes(role)) {
    return res.status(400).json('Role must be either "buyer" or "seller"');
  }

  // create an object with the new password and/or role
  const data: any = {};
  if (password) data.password = password;
  if (role) data.role = role;
  
  try {
    const user = await userController.update.userByUsername(username, data);
  
    res.status(200).json({ user, message: 'User updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user by username
router.delete('/:username', withAuth, async (req: Request | any, res: Response) => {
  const { username } = req.params;
  const { user: { username: jwtUsername } } = req.jwt

  if (username !== jwtUsername) {
    return res.status(403).json('You are not authorized to access this resource');
  }

  try {
    await userController.delete.userByUsername(username);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.meta?.cause || err.message });
  }
});

export default router;
