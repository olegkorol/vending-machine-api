import jwt from 'jsonwebtoken';
import config from '../config';

const { jwtSecret } = config;

export const createToken = (user: any) => {
  return jwt.sign({ user }, jwtSecret);
}

export const tryCatch = <Fn extends (...args: any[]) => Promise<any> | Error>(fn: Fn, logger?: any): any => {
  return async (...args: Parameters<Fn>) => {
    try {
      // Call the original function
      return await fn(...args);
    } catch (err: any) {
      // Handle any exceptions
      if (logger) {
        logger.error(err);
      } else {
        console.error(err);
      }
      throw new Error(err)
    }
  };
};

