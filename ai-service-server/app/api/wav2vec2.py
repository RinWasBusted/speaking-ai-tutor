from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import tempfile
import os

from app.core.wav2vec2 import transcribe_phonemes

router = APIRouter()

@router.post("/transcribe-phonemes")
async def transcribe_audio_phonemes(file: UploadFile = File(...)):
    """
    Upload an audio file to get a phoneme transcription using Wav2Vec2.
    Supports WAV, MP3, etc.
    """
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        try:
            shutil.copyfileobj(file.file, temp_file)
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    try:
        phonemes = transcribe_phonemes(temp_path)
        return {"phonemes": phonemes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phoneme transcription failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
