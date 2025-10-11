#!/bin/bash
cd "$(dirname "$0")"
/home/vscode/.local/bin/python -m sphinx_autobuild . _build/html --port 8000 --open-browser