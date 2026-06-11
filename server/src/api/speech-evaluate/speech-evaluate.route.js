import express from 'express';
import upload from '../../util/multer.js';
import * as speechEvaluateController from './speech-evaluate.controller.js';

const router = express.Router();

// Route to handle speech audio evaluation
router.post('/evaluate', upload.single('audio'), speechEvaluateController.evaluateSpeechController);

export default router;
