import numpy as np
import os
import multiprocessing
from typing import List, Dict, Any
from pywhispercpp.model import Model
import _pywhispercpp as pw
from app.core.config import settings

# Global whisper model instance
whisper_model = None

def get_whisper_model() -> Model:
    """Get the loaded whisper model instance."""
    global whisper_model
    if whisper_model is None:
        raise RuntimeError("Whisper model is not initialized yet.")
    return whisper_model

def load_whisper_model():
    """Initializes the whisper model with configuration similar to whisper_cpp_word_by_word.ipynb"""
    global whisper_model
    
    model_path = settings.WHISPER_MODEL_PATH
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Whisper model file not found at: {model_path}")
        
    num_threads = min(multiprocessing.cpu_count(), 8)
    initial_prompt = (
        "Um, uh, like, you know, so, hmm, okay, well, right, "
        "actually, I mean, kind of, sort of, basically,"
    )
    
    # Context parameters configure whisper context before/during loading.
    # We disable flash_attn and enable dtw_token_timestamps for alignment,
    # specifying WHISPER_AHEADS_BASE_EN preset for 'base.en' model.
    context_params = {
        "dtw_token_timestamps": True,
        "flash_attn": False,
        "dtw_aheads_preset": pw.whisper_alignment_heads_preset.WHISPER_AHEADS_BASE_EN
    }
    
    # We pass the inference parameters (token_timestamps, max_len, split_on_word, initial_prompt, n_threads)
    # matching the word-by-word config from the notebook.
    whisper_model = Model(
        model=model_path,
        context_params=context_params,
        n_threads=num_threads,
        token_timestamps=True,
        max_len=1,
        split_on_word=True,
        initial_prompt=initial_prompt
    )
    
    print("✅ Whisper model loaded successfully.")

def ms_to_hms(ms: int) -> str:
    """Convert milliseconds → HH:MM:SS.mmm string."""
    total_s, ms_rem = divmod(ms, 1000)
    total_m, secs   = divmod(total_s, 60)
    hours, mins     = divmod(total_m, 60)
    return f"{hours:02d}:{mins:02d}:{secs:02d}.{ms_rem:03d}"

def transcribe_audio_to_word_list(waveform: np.ndarray) -> List[Dict[str, Any]]:
    """
    Transcribe the given audio waveform (float32 numpy array) using the pre-loaded Whisper model.
    Returns a list of transcribed words with their starting time, ending time, and duration
    similar to the output of '/home/thaian0609asd/Downloads/whisper_cpp_word_by_word(2).ipynb'.
    """
    model = get_whisper_model()
    
    # transcribe accepts a float32 numpy array directly
    raw_segments = model.transcribe(waveform)
    
    word_list = []
    for seg in raw_segments:
        surface = seg.text.strip()
        if not surface:
            continue
            
        # Segment times in pywhispercpp are represented in milliseconds or 10-millisecond units depending on backend.
        # pywhispercpp segment.t0 and segment.t1 are in 10ms units (centiseconds), so we multiply by 10 to get milliseconds.
        # Let's verify: whisper.cpp returns time segments in centiseconds (10ms steps).
        start_ms = seg.t0 * 10
        end_ms   = seg.t1 * 10
        
        word_list.append({
            "index":       len(word_list) + 1,
            "word":        surface,
            "start_ms":    start_ms,
            "end_ms":      end_ms,
            "duration_ms": end_ms - start_ms,
            "start_time":  ms_to_hms(start_ms),
            "end_time":    ms_to_hms(end_ms),
        })
        
    return word_list

