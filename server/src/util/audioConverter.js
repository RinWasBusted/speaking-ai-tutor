import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Converts input audio file to 16kHz mono WAV format.
 * @param {string} inputPath - Absolute path to the source audio file.
 * @returns {Promise<string>} - Promise resolving to the absolute path of the converted audio file.
 */
export function convertAudioTo16kMono(inputPath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, '_16k_mono.wav');

    ffmpeg(inputPath)
      .outputOptions([
        '-ar 16000', // 16kHz sample rate
        '-ac 1'      // 1 channel (mono)
      ])
      .save(outputPath)
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
