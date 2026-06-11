import * as exerciseService from './exercise.service.js';

/**
 * Controller to handle paragraph generation.
 */
export async function generateExerciseController(req, res) {
  try {
    const paragraph = await exerciseService.generateParagraph();
    res.status(200).json({ paragraph });
  } catch (error) {
    console.error('Error generating exercise paragraph:', error);
    res.status(500).json({ error: 'Failed to generate exercise paragraph.' });
  }
}
