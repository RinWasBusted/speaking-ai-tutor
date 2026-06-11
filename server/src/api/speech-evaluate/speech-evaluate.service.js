import { convertAudioTo16kMono } from '../../util/audioConverter.js';
import { transcribeAudio, transcribePhonemes, generateResponse } from '../../service/ai.service.js';
import fs from 'fs';

/**
 * Service to process speech evaluation.
 * @param {string} inputPath - Absolute path of the uploaded audio file.
 * @param {string} originalParagraph - The original paragraph prompt the user read.
 * @returns {Promise<{ transcription: Array<Object>, evaluation: string }>}
 */
export async function evaluateSpeech(inputPath, originalParagraph) {
  // Convert audio to 16kHz mono WAV for Whisper & Wav2Vec2 transcription
  const outputPath = await convertAudioTo16kMono(inputPath);

  let transcription = null;
  let phonemeResult = null;
  try {
    // Transcribe the converted mono WAV file using Whisper
    transcription = transcribeAudio(outputPath);
    
    // Transcribe phonemes using Wav2Vec2
    phonemeResult = transcribePhonemes(outputPath);

    [transcription, phonemeResult] = await Promise.all([transcription, phonemeResult]);
  } finally {
    // Delete the converted file immediately after transcription attempts
    if (fs.existsSync(outputPath)) {
      fs.unlink(outputPath, (err) => {
        if (err) console.error(`Failed to delete converted file ${outputPath}:`, err);
      });
    }
  }

  const phonemesText = phonemeResult?.phonemes || 'No phoneme transcription available.';

  // Format transcribed words with their time offsets
  const wordOffsetsStr = transcription
    .map(item => `${item.index}. "${item.word}" (Start: ${item.start_time}, End: ${item.end_time})`)
    .join('\n');

  // Define the system prompt with the tutor soul and requested feedback structure
  const systemPrompt = `You are an encouraging and expert English speaking tutor. Your job is to analyze a student's speech based on word timestamps/offsets and the phoneme sequence.
Evaluate the speech carefully and provide constructive, detailed, and actionable feedback.

You must evaluate the speech based on these criteria:
1. Pronunciation (assess phonetic accuracy based on phonemes and word alignment)
2. Intonation (evaluate pitch variation, sentence stress, and tone based on word durations)
3. Vocabulary (analyze word choice, appropriateness, and sophistication)
4. Grammar (identify grammatical issues, structure, and suggest corrections)
5. Fluency (evaluate flow, rhythm, pauses, and pacing based on word timestamps)
6. Coherence & Content Relevance (check logical connection and relevance to the original text read)

Your feedback must be structured cleanly with the following sections:
- Overall Impression: A warm, positive, and encouraging summary of their attempt.
- Key Strengths: Point out exactly what they did well (e.g., specific pronunciation, correct phrasing, vocabulary, or good pacing).
- Areas for Improvement & Practice Guide:
  - Identify the exact weak points of the speech.
  - Provide concrete, step-by-step instructions on how to fix these weak points.
  - Teach the user how to improve their pronunciation (e.g., phonemes to focus on, tongue placement, or word connections) and how to improve the answer or phrasing.
- Detailed Criteria Evaluation:
  - Pronunciation: [Feedback & Score/Rating]
  - Intonation: [Feedback & Score/Rating]
  - Vocabulary: [Feedback & Score/Rating]
  - Grammar: [Feedback & Score/Rating]
  - Fluency: [Feedback & Score/Rating]
  - Coherence & Content Relevance: [Feedback & Score/Rating]`;

  // Define the normal user prompt containing the transcript data with offsets and phonemes
  const userPrompt = `Here is the data from the student's speech:

Original paragraph to read:
"${originalParagraph || 'Not provided'}"

1. Transcribed Words with their Time Offsets:
${wordOffsetsStr}

2. Phoneme Transcription (using Wav2Vec2):
"${phonemesText}"

Please evaluate this speech data and provide your comprehensive tutor feedback following the structured format.`;

  // Call LLM using generateResponse, passing separated system and user prompts via options.messages
  const evaluation = await generateResponse('', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  return {
    // transcription,
    evaluation
  };
}

