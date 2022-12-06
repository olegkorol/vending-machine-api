// load env vars from dotenv file
import * as dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  sessionSecret: process.env.SESSION_SECRET || 'secret',
} as {
  port: number;
  jwtSecret: Secret;
  sessionSecret: string;
}
