import express from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running perfectly!' });
});

export default app;
