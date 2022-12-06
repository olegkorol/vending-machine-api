import { Router, type Request, type Response } from 'express';
import { 
  createToken, 
  addSessionToActiveSessions, 
  checkForOtherActiveSessions, 
  // getEverything, 
  removeSessionAndToken, 
  removeAllActiveSessionsAndTokens 
} from '../utils/auth';
import userController from '../controllers/user';
import { withAuth } from '../middleware';

const router = Router();

router.post('/login', async function (req: Request | any, res: Response) {
  // Get the username and password from the request body.
  const { username, password } = req.body;

  // Check if the username and password are the same as in DB.
  const user = await userController.read.userByUsername(username, true);

  // Check if the username and password are valid.
  if (username === user?.username && password === user?.password) {
    console.log('new session?', req.session.user === undefined)
    const token = createToken({ username });

    req.session.user = {
      username,
    }
    
    // Store the session ID in the active sessions object to keep track of it.
    addSessionToActiveSessions(req.sessionID, user);
    
    // Check whether there are any active sessions for the user already.
    const otherActiveSessions = checkForOtherActiveSessions(user, req.sessionID);
    
    // Return the JWT in the response.
    res.status(200).json({ token, ...(otherActiveSessions && { warning: 'This user has other active sessions' }) });
  } else {
    // If the credentials are not valid, return a 401 Unauthorized response.
    res.status(401).send({ error: "Unauthorized" });
  }
});

router.post('/logout', withAuth, async function (req: Request | any, res: Response) {
  const sessionID = req.sessionID;
  const { user } = req.session;
  const token = req.headers.authorization?.split(' ')[1];

  if (!sessionID || !token) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  req.session.destroy(function (err: any) {
    if (err) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    removeSessionAndToken(sessionID, token, user);

    res.status(200).send({ message: "Logged out" });
  });
});

router.post('/logout/all', withAuth, async function (req: Request | any, res: Response) {
  const sessionID = req.sessionID;
  const { user } = req.session;
  const token = req.headers.authorization?.split(' ')[1];

  if (!sessionID || !token) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  // in a real-world environment, we would call the store's `destroy` method to destroy all sessions for this user,
  // not just the active one, as below:
  req.session.destroy(function (err: any) {
    if (err) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // remove all in memory records of sessions and tokens for this user
    removeAllActiveSessionsAndTokens(user);

    res.status(200).send({ message: "Logged out" });
  });
});

// for debugging purposes only
// router.get('/check', async function (req: Request | any, res: Response) {
//   res.json(getEverything());
// });

export default router;