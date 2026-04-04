#!/bin/bash
cd backend
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:8000 --workers 4 --worker-class sync --timeout 60 app:app
