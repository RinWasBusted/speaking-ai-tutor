import axios from 'axios';
import FormData from 'form-data';

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
    temperature: options.temperature ?? 0.6,
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
 * Transcribes an audio WAV buffer using the custom Whisper API hosted on the ai-service-server.
 * @param {Buffer} wavBuffer - The in-memory WAV audio buffer.
 * @returns {Promise<Array<Object>>} - The list of transcription words with timestamps/details.
 */
export async function transcribeAudio(wavBuffer) {
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

  if (!Buffer.isBuffer(wavBuffer)) {
    throw new Error('Audio data must be provided as a Buffer.');
  }

  const formData = new FormData();
  formData.append('file', wavBuffer, {
    filename: 'recording.wav',
    contentType: 'audio/wav',
  });

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

/**
 * Transcribes phonemes from an audio WAV buffer using the custom Wav2Vec2 API hosted on the ai-service-server.
 * @param {Buffer} wavBuffer - The in-memory WAV audio buffer.
 * @returns {Promise<{phonemes: string}>} - The response containing the transcribed phonemes.
 */
export async function transcribePhonemes(wavBuffer) {
  const serviceEndpoint = process.env.AI_SERVICE_ENDPOINT;

  if (!serviceEndpoint) {
    throw new Error('AI_SERVICE_ENDPOINT is not defined in the environment variables.');
  }

  // Construct URL. The endpoint on ai-service-server is /api/v1/transcribe-phonemes
  const url = serviceEndpoint.endsWith('/api/v1')
    ? `${serviceEndpoint}/transcribe-phonemes`
    : serviceEndpoint.endsWith('/api/v1/transcribe-phonemes')
      ? serviceEndpoint
      : `${serviceEndpoint.replace(/\/$/, '')}/api/v1/transcribe-phonemes`;

  if (!Buffer.isBuffer(wavBuffer)) {
    throw new Error('Audio data must be provided as a Buffer.');
  }

  const formData = new FormData();
  formData.append('file', wavBuffer, {
    filename: 'recording.wav',
    contentType: 'audio/wav',
  });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      // Increase timeout if transcription takes longer
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail 
      || error.response?.data 
      || error.message;
    throw new Error(`Wav2Vec2 phoneme transcription request failed: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`);
  }
}
