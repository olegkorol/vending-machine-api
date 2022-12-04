import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '../prisma-client';

import config from '../config';
const { jwtSecret } = config;

export function withAuth(req: Request | any, res: Response, next: NextFunction) {
  // Get the authorization header from the request.
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    // If the authorization header is not present, return a 401 Unauthorized response.
    return res.status(401).send({ error: "Unauthorized" });
  }

  // Get the JWT from the authorization header.
  const token = authorizationHeader.split(" ")[1];

  // Verify the JWT using the secret key.
  jwt.verify(token, jwtSecret, (error: any, user: any) => {
    if (error) {
      // If the JWT is not valid, return a 401 Unauthorized response.
      return res.status(401).send({ error: "Unauthorized" });
    }

    // Add the decoded JWT to the request object.
    req.jwt = user;

    // If the JWT is valid, call the next middleware or route handler.
    next();
  });
}

export default withAuth;
