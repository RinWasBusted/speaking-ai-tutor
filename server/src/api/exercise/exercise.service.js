import { generateResponse } from '../../service/ai.service.js';

/**
 * Generates a TOEIC Speaking Part 1 style paragraph.
 * @returns {Promise<string>} - The generated paragraph.
 */
export async function generateParagraph() {
  const prompt = `You are a professional TOEIC test creator. Generate a single paragraph suitable for TOEIC Speaking Part 1 (Read a text aloud).
The paragraph should be around 40-70 words.
It should look like a typical TOEIC Part 1 reading text, such as an advertisement, announcement, introduction, report, or message.
Return only the paragraph text itself. Do not include any titles, introductory phrases, quotes, or markdown block styling.`;

  const paragraph = await generateResponse(prompt);
  return paragraph.trim();
}
