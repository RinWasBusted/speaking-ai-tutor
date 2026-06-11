import { convertAudioTo16kMono } from '../../util/audioConverter.js';
import { transcribeAudio, transcribePhonemes, generateResponse } from '../../service/ai.service.js';

/**
 * Service to process speech evaluation.
 * @param {Buffer} audioBuffer - In-memory buffer of the uploaded audio file.
 * @param {string} originalParagraph - The original paragraph prompt the user read.
 * @returns {Promise<{ transcription: Array<Object>, evaluation: string }>}
 */
export async function evaluateSpeech(audioBuffer, originalParagraph) {
  // Convert audio buffer to 16kHz mono WAV buffer in-memory for Whisper & Wav2Vec2 transcription
  const wavBuffer = await convertAudioTo16kMono(audioBuffer);

  let transcription = null;
  let phonemeResult = null;
  try {
    // Transcribe the converted mono WAV buffer using Whisper
    transcription = transcribeAudio(wavBuffer);
    
    // Transcribe phonemes using Wav2Vec2
    phonemeResult = transcribePhonemes(wavBuffer);

    [transcription, phonemeResult] = await Promise.all([transcription, phonemeResult]);
  } finally {
    // No file cleanup is necessary anymore since everything is processed in-memory
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

