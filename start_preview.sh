#!/bin/bash
source "$(dirname "$0")/.venv/bin/activate"
cd "$(dirname "$0")"
python -m sphinx_autobuild . _build/html --port 8000 --open-browser