#!/bin/bash
cd "$(dirname "$0")"
sphinx-autobuild . _build/html --port 8000 --open-browser
