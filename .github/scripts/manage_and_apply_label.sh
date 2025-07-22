#!/bin/bash

LABEL_NAME=$1
LABEL_COLOR=$2

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

LABEL_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/labels"
PR_LABELS_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels"

curl -s -X POST "$LABEL_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$LABEL_NAME" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')" || true

curl -s -X POST "$PR_LABELS_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg label "$LABEL_NAME" '[$label]')"

echo "Label '$LABEL_NAME' applied to PR #$PR_NUMBER"
