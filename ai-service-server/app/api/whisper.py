from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.core.whisper import transcribe_audio_to_word_list
from app.util.audio import wav_buffer_to_float32_ndarray

router = APIRouter()

@router.post("/transcribe", response_model=List[Dict[str, Any]])
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Upload a WAV audio file to get a word-by-word transcription with precise timestamps.
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
        # Perform transcription using the preloaded Whisper model
        word_list = transcribe_audio_to_word_list(waveform)
        return word_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
