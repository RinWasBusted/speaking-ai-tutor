import api from '../util/api';

/**
 * Sends speech audio to the speech evaluation API.
 * @param {Object} params - The params object.
 * @param {Blob} params.audioBlob - The recorded speech audio blob.
 * @param {string} params.paragraph - The original paragraph read by the user.
 * @returns {Promise<any>} The response data from the speech evaluation API.
 */
export const evaluateSpeech = async ({ audioBlob, paragraph }) => {
  const formData = new FormData();
  // Name the field 'audio' as expected by multer in the server route: upload.single('audio')
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('paragraph', paragraph);

  const response = await api.post('/speech-evaluate/evaluate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
