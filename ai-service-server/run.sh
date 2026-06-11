#!/bin/bash
cd /home/thaian0609asd/Documents/Project/speaking-ai-tutor/ai-service-server
exec .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
