import express from 'express';
import * as exerciseController from './exercise.controller.js';

const router = express.Router();

// Route to generate a new reading exercise (TOEIC Speaking Part 1 style paragraph)
router.get('/generate', exerciseController.generateExerciseController);

export default router;
