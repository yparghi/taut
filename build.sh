#!/usr/bin/env bash

# Options:
# $1 Name for this dir/workspace/instance (arbitrary)
# $2 Path to a text file with the API Key for the workspace

set -u
set -e
set -x

mkdir -p build

DIR="build/$1"
rm -rf $DIR
mkdir $DIR

cp index.html "$DIR/index.html"
cp taut.css "$DIR/taut.css"
cp taut.js "$DIR/taut.js"

TAUT_VAR_INSTANCE_NAME="$1"
TAUT_VAR_SLACK_API_TOKEN=$(<"$2")

if [[ "$OSTYPE" == "darwin"* ]]; then
    # Handle mac sed, ugh.
    sed -i '' 's/TAUT_VAR_SLACK_API_TOKEN/'"$TAUT_VAR_SLACK_API_TOKEN"'/g' "$DIR/taut.js"
    sed -i '' 's/TAUT_VAR_INSTANCE_NAME/'"$TAUT_VAR_INSTANCE_NAME"'/g' "$DIR/index.html"

else
    sed -i 's/TAUT_VAR_SLACK_API_TOKEN/'"$TAUT_VAR_SLACK_API_TOKEN"'/g' "$DIR/taut.js"
    sed -i 's/TAUT_VAR_INSTANCE_NAME/'"$TAUT_VAR_INSTANCE_NAME"'/g' "$DIR/index.html"
fi

