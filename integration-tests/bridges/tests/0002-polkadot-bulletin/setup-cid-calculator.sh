#!/bin/bash

# Setup script to ensure calculate_cid dependencies are installed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CID_CALCULATOR_PATH="$SCRIPT_DIR/../../environments/polkadot-people-bulletin/calculate_cid"

echo "Setting up CID calculator dependencies..."

if [ ! -d "$CID_CALCULATOR_PATH/node_modules" ]; then
    echo "Installing calculate_cid dependencies..."
    cd "$CID_CALCULATOR_PATH"
    npm install
    echo "Dependencies installed successfully."
else
    echo "Dependencies already installed."
fi

echo "CID calculator setup complete."
