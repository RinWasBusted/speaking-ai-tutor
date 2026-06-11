import * as speechEvaluateService from './speech-evaluate.service.js';

/**
 * Controller to handle the speech evaluation request.
 */
export async function evaluateSpeechController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    const { paragraph } = req.body;
    const result = await speechEvaluateService.evaluateSpeech(req.file.buffer, paragraph);

    res.status(200).json({
      transcription: result.transcription,
      evaluation: result.evaluation
    });
  } catch (error) {
    console.error('Error during speech evaluation:', error);
    res.status(500).json({ error: 'Failed to process audio file.' });
  }
}
