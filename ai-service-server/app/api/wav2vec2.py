from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.wav2vec2 import transcribe_phonemes
from app.util.audio import wav_buffer_to_float32_ndarray

router = APIRouter()

@router.post("/transcribe-phonemes")
async def transcribe_audio_phonemes(file: UploadFile = File(...)):
    """
    Upload a WAV audio file to get a phoneme transcription using Wav2Vec2.
    The WAV bytes are read and decoded directly in memory.
    """
    try:
        # Read the file bytes directly in memory
        file_bytes = await file.read()
        
        # Convert WAV bytes to float32 NumPy array
        waveform = wav_buffer_to_float32_ndarray(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read/decode audio file: {str(e)}")

    try:
        phonemes = transcribe_phonemes(waveform)
        return {"phonemes": phonemes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phoneme transcription failed: {str(e)}")
