# import torch
# import librosa
# import numpy as np
# from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from app.core.config import settings

# Global variables to hold model and processor
processor = None
model = None
device = None

TARGET_SR = 16000  # Model expects 16 kHz audio

def load_wav2vec2_model():
    """
    Initializes and loads the Wav2Vec2 phoneme transcription model and processor.
    Uses the local path configuration matching the downloaded weights / configuration.
    """
    pass
    # global processor, model, device
    #
    # model_path = settings.WAV2VEC2_MODEL_PATH
    # print(f"Loading Wav2Vec2 model from: {model_path}")
    #
    # # Determine device: GPU if available, else CPU
    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # print(f"Wav2Vec2 Device: {'GPU ✅' if torch.cuda.is_available() else 'CPU ⚠️  (GPU recommended)'}")
    #
    # # Load processor and model from local path
    # processor = Wav2Vec2Processor.from_pretrained(model_path)
    # model = Wav2Vec2ForCTC.from_pretrained(model_path).to(device)
    # model.eval()
    #
    # print("✅ Wav2Vec2 model loaded successfully!")

def get_wav2vec2_model():
    """Get the loaded Wav2Vec2 model, processor, and device."""
    # if model is None or processor is None or device is None:
    #     raise RuntimeError("Wav2Vec2 model is not initialized yet.")
    # return model, processor, device
    pass

def load_audio(path: str):
    """Load and resample audio to 16 kHz mono."""
    # waveform, sr = librosa.load(path, sr=TARGET_SR, mono=True)
    # print(f"  Audio loaded  |  duration: {len(waveform)/TARGET_SR:.2f}s  |  sample rate: {TARGET_SR} Hz")
    # return waveform
    pass

def transcribe_phonemes(audio_path: str) -> str:
    """
    Load an audio file and return the phoneme transcription.

    Args:
        audio_path: Path to a .wav, .mp3, .flac, or other audio file.

    Returns:
        Space-separated phoneme string, e.g. 'HH AH L OW W ER L D'
    """
    # model_instance, processor_instance, device_instance = get_wav2vec2_model()
    #
    # # 1. Load audio
    # waveform = load_audio(audio_path)
    #
    # # 2. Preprocess
    # inputs = processor_instance(
    #     waveform,
    #     sampling_rate=TARGET_SR,
    #     return_tensors="pt",
    #     padding=True
    # )
    # input_values = inputs.input_values.to(device_instance)
    #
    # # 3. Inference
    # with torch.no_grad():
    #     logits = model_instance(input_values).logits
    #
    # # 4. Greedy CTC decoding
    # predicted_ids = torch.argmax(logits, dim=-1)
    # transcription = processor_instance.batch_decode(predicted_ids)[0]
    #
    # return transcription
    pass

