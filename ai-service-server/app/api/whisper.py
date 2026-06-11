from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import shutil
import tempfile
import os

from app.core.whisper import transcribe_audio_to_word_list

router = APIRouter()

@router.post("/transcribe", response_model=List[Dict[str, Any]])
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Upload an audio file to get a word-by-word transcription with precise timestamps.
    Supports WAV, MP3, M4A, etc. (requires ffmpeg installed on system for non-WAV formats).
    """
    # Create a temporary file to save the uploaded file
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        try:
            # Write uploaded file contents to the temp file
            shutil.copyfileobj(file.file, temp_file)
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    try:
        # Perform transcription using the preloaded Whisper model
        word_list = transcribe_audio_to_word_list(temp_path)
        return word_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
