import jwt from 'jsonwebtoken';
import config from '../config';

const { jwtSecret } = config;

// in memory storage for the active sessions and tokens
const activeTokens: any = {};
const activeSessions: any = {};

export const createToken = (user: any): string => {
  const token =  jwt.sign({ user }, jwtSecret);
  addTokenToActiveTokens(token, user);
  return token;
}

const addTokenToActiveTokens = (token: string, user: any): void => {
  activeTokens[user.username] = [...(activeTokens[user.username] || []), token];
  console.log({ activeTokens });
  return;
}

export const addSessionToActiveSessions = (sessionID: string, user: any): void => {
  // add session to activeSessions only if the sessionID does not already exist for the user
  if (!activeSessions[user.username]?.includes(sessionID)) {
    activeSessions[user.username] = [...(activeSessions[user.username] || []), sessionID];
  }
  console.log({ activeSessions });
  return;
}

export const checkForOtherActiveSessions = (user: any, sessionID: string): boolean => {
  const otherActiveSessions = activeSessions[user.username]?.filter((session: string) => session !== sessionID);
  return !!otherActiveSessions?.length;
}

export const removeSessionAndToken = (sessionID: string, jwt: string, user: any): void => {
  console.log('removing session and token', { sessionID, jwt, user })
  activeSessions[user.username] = activeSessions[user.username]?.filter((session: string) => session !== sessionID);
  activeTokens[user.username] = activeTokens[user.username]?.filter((token: string) => token !== jwt);
  return;
}

export const getAllSessionsForUser = (user: any): any => {
  return activeSessions[user.username];
}

export const removeAllActiveSessionsAndTokens = (user: any): void => {
  // only in memory records
  delete activeSessions[user.username];
  delete activeTokens[user.username];
  return;
}

// export const getEverything = (): any => {
//   return { activeTokens, activeSessions };
// }