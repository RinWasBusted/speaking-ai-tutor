import express from 'express';
import speechEvaluateRouter from './speech-evaluate/speech-evaluate.route.js';
import exerciseRouter from './exercise/exercise.route.js';

const router = express.Router();

router.use('/speech-evaluate', speechEvaluateRouter);
router.use('/exercise', exerciseRouter);

export default router;
