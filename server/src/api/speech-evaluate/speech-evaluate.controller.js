import * as speechEvaluateService from './speech-evaluate.service.js';
import fs from 'fs';

/**
 * Controller to handle the speech evaluation request.
 */
export async function evaluateSpeechController(req, res) {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    tempFilePath = req.file.path;
    const result = await speechEvaluateService.evaluateSpeech(tempFilePath);

    res.status(200).json({
      transcription: result.transcription,
      evaluation: result.evaluation
    });
  } catch (error) {
    console.error('Error during speech evaluation:', error);
    res.status(500).json({ error: 'Failed to process audio file.' });
  } finally {
    // Delete the original uploaded file since we don't need to store it
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error(`Failed to delete temporary file ${tempFilePath}:`, err);
      });
    }
  }
}
