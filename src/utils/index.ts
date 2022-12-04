import jwt from 'jsonwebtoken';
import config from '../config';

const { jwtSecret } = config;

export function createToken(user: any) {
  return jwt.sign({ user }, jwtSecret);
}
