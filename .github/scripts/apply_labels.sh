#!/bin/bash

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")
LABEL_NAME=$1

curl -s -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg label "$LABEL_NAME" '[$label]')"

echo "Label applied: $LABEL_NAME"
