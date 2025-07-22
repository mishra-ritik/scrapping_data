#!/bin/bash
LABEL_NAME=$1

curl -s -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${{github.event.pull_request.number}}/labels" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg label "$LABEL_NAME" '[$label]')"

echo "Label applied: $LABEL_NAME"
