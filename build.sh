#!/usr/bin/env bash

# Options:
# $1 Name for this dir/workspace/instance (arbitrary)
# $2 API Key for the workspace

set -u
set -e
set -x

mkdir -p build

DIR="build/$1"
rm -rf $DIR
mkdir $DIR

cp index.html "$DIR/index.html"
cp taut.js "$DIR/taut.js"

TAUT_VAR_SLACK_API_TOKEN="$2"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac parameter for a backup file, ugh.
    sed -i '' 's/TAUT_VAR_SLACK_API_TOKEN/'"$TAUT_VAR_SLACK_API_TOKEN"'/g' "$DIR/taut.js"
else
    sed -i 's/TAUT_VAR_SLACK_API_TOKEN/'"$TAUT_VAR_SLACK_API_TOKEN"'/g' "$DIR/taut.js"
fi

