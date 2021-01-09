#!/usr/bin/env bash

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
sed -i 's/TAUT_VAR_SLACK_API_TOKEN/'"$TAUT_VAR_SLACK_API_TOKEN"'/g' "$DIR/taut.js"
