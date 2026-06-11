import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Sends a prompt to the configured OpenAI-compatible AI API and returns the generated text.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {object} [options] - Additional options (e.g., model, temperature).
 * @returns {Promise<string>} - The text response from the AI.
 */
export async function generateResponse(prompt, options = {}) {
  const apiKey = process.env.AI_API_KEY;
  const apiEndpoint = process.env.AI_API_ENDPOINT;

  if (!apiEndpoint) {
    throw new Error('AI_API_ENDPOINT is not defined in the environment variables.');
  }

  // Construct URL. Many OpenAI-compatible APIs expect /chat/completions.
  // We'll normalize the endpoint to ensure it ends correctly.
  const url = apiEndpoint.endsWith('/chat/completions')
    ? apiEndpoint
    : `${apiEndpoint.replace(/\/$/, '')}/chat/completions`;

  const requestBody = {
    model: options.model || 'my-combo', // Default model for 9router combo
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature ?? 0.7,
    stream: false,
    ...options
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
    return data.choices[0].message.content;
  }

  throw new Error('Unexpected response format from AI API.');
}

/**
 * Transcribes an audio file using the custom Whisper API hosted on the ai-service-server.
 * @param {string} filePath - Absolute or relative path to the audio file.
 * @returns {Promise<Array<Object>>} - The list of transcription words with timestamps/details.
 */
export async function transcribeAudio(filePath) {
  const serviceEndpoint = process.env.AI_SERVICE_ENDPOINT;

  if (!serviceEndpoint) {
    throw new Error('AI_SERVICE_ENDPOINT is not defined in the environment variables.');
  }

  // Construct transcribe URL. The endpoint on ai-service-server is /api/v1/transcribe
  const url = serviceEndpoint.endsWith('/api/v1')
    ? `${serviceEndpoint}/transcribe`
    : serviceEndpoint.endsWith('/api/v1/transcribe')
      ? serviceEndpoint
      : `${serviceEndpoint.replace(/\/$/, '')}/api/v1/transcribe`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      // Increase timeout if transcription takes longer for large files
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail 
      || error.response?.data 
      || error.message;
    throw new Error(`Whisper transcription request failed: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`);
  }
}
