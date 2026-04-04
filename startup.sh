#!/bin/bash
pip install -r backend/requirements.txt
gunicorn --bind 0.0.0.0:8000 --workers 4 --worker-class sync --timeout 60 backend.app:app
