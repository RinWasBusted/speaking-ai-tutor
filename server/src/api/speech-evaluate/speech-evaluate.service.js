import { convertAudioTo16kMono } from '../../util/audioConverter.js';
import { transcribeAudio, generateResponse } from '../../service/ai.service.js';
import fs from 'fs';

/**
 * Service to process speech evaluation.
 * @param {string} inputPath - Absolute path of the uploaded audio file.
 * @returns {Promise<{ transcription: Array<Object>, evaluation: string }>}
 */
export async function evaluateSpeech(inputPath) {
  // Convert audio to 16kHz mono WAV for Whisper transcription
  const outputPath = await convertAudioTo16kMono(inputPath);

  let transcription = null;
  try {
    // Transcribe the converted mono WAV file using Whisper
    transcription = await transcribeAudio(outputPath);
  } finally {
    // Delete the converted file immediately after transcription attempt
    if (fs.existsSync(outputPath)) {
      fs.unlink(outputPath, (err) => {
        if (err) console.error(`Failed to delete converted file ${outputPath}:`, err);
      });
    }
  }

  // extract the text sequence from Whisper's word list
  const fullText = transcription.map(item => item.word).join(' ');

  // Create prompt for the English Speaking Tutor LLM
  const prompt = `You are an encouraging and expert English speaking tutor. Analyze the following transcribed text from a student's speech and evaluate their fluency, grammar, and vocabulary. Provide actionable feedback to help them improve.

Transcribed speech: "${fullText}"

Please structured your feedback like this:
1. Overall Impression: (a brief positive and encouraging summary)
2. Grammar & Vocabulary: (highlight mistakes or areas for improvement, and suggest better alternatives)
3. Fluency Feedback: (evaluate the phrasing and flow)
`;

  // Call LLM using generateResponse
  const evaluation = await generateResponse(prompt);

  return {
    transcription,
    evaluation
  };
}

