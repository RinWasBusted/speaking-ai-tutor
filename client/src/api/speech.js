import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

/**
 * Sends speech audio to the speech evaluation API.
 * @param {Blob} audioBlob - The recorded speech audio blob.
 * @returns {Promise<any>} The response data from the speech evaluation API.
 */
export const evaluateSpeech = async (audioBlob) => {
  const formData = new FormData();
  // Name the field 'audio' as expected by multer in the server route: upload.single('audio')
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await api.post('/speech-evaluate/evaluate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
