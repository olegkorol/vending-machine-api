// load env vars from dotenv file
import * as dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
} as {
  port: number;
  jwtSecret: Secret;
}
