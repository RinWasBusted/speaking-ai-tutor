import api from '../util/api';

/**
 * Fetches a generated paragraph speaking exercise.
 * @returns {Promise<any>} The response containing the generated paragraph.
 */
export const generateExercise = async () => {
  const response = await api.get('/exercise/generate');
  return response.data;
};
