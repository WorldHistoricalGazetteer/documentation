#!/bin/bash
source .venv/bin/activate
cd "$(dirname "$0")"
sphinx-autobuild . _build/html --port 8000 --open-browser
