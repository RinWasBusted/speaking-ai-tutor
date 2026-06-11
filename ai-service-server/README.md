# Speaking AI Tutor - AI Service Server

This is the FastAPI backend for the AI Service of the Speaking AI Tutor project.

## Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The application will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000). You can check the health endpoint at `/health`.
