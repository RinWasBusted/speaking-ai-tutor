import ffmpeg from 'fluent-ffmpeg';
import { Readable, Writable } from 'stream';

/**
 * Converts input audio buffer to 16kHz mono WAV format in-memory.
 * @param {Buffer} inputBuffer - In-memory buffer of the source audio file.
 * @returns {Promise<Buffer>} - Promise resolving to the WAV file buffer.
 */
export function convertAudioTo16kMono(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(inputBuffer);
    const chunks = [];

    const outputStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    ffmpeg(inputStream)
      .toFormat('wav')
      .outputOptions([
        '-ar 16000', // 16kHz sample rate
        '-ac 1'      // 1 channel (mono)
      ])
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      })
      .pipe(outputStream);
  });
}
