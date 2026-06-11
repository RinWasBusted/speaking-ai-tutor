import express from 'express';
import speechEvaluateRouter from './speech-evaluate/speech-evaluate.route.js';

const router = express.Router();

router.use('/speech-evaluate', speechEvaluateRouter);

export default router;
