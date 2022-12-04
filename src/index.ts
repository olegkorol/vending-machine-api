import express, { Application } from 'express';
import { withAuth, onlySellers, onlyBuyers } from './middleware';

import authRouter from './routes/auth';
import userRouter from './routes/user';
import sellerRouter from './routes/seller';
import machineRouter from './routes/machine';

const app: Application = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/seller', withAuth, onlySellers, sellerRouter);
app.use('/machine', withAuth, onlyBuyers, machineRouter);

app.listen(process.env.PORT || 3000, function () {
  console.log('server started on port 3000');
});
