import io
import soundfile as sf
import numpy as np

def wav_buffer_to_float32_ndarray(wav_buffer: bytes) -> np.ndarray:
    """
    Decodes an in-memory WAV data buffer (bytes) into a float32 NumPy array.
    Automatically handles normalization to range [-1.0, 1.0].
    
    :param wav_buffer: The raw WAV bytes.
    :return: A 1D NumPy array of float32 values.
    """
    # Wrap the bytes buffer in a BytesIO stream
    wav_io = io.BytesIO(wav_buffer)
    
    # Read the wav data using soundfile
    # sf.read automatically returns float32 dtype and normalizes audio between -1.0 and 1.0
    data, sample_rate = sf.read(wav_io, dtype='float32')
    
    # If the audio has multiple channels, mix down to mono by averaging the channels
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
        
    return data
