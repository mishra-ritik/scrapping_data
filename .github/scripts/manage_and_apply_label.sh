#!/bin/bash

# Usage: ./manage_and_apply_label.sh <LABEL_NAME> <LABEL_COLOR>

LABEL_NAME=$1
LABEL_COLOR=$2

# Get the PR number from GitHub context
PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")

# API endpoints
LABEL_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/labels"
PR_LABELS_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels"

# Try to create the label (suppress error if it already exists)
curl -s -X POST "$LABEL_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$LABEL_NAME" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')" || true

# Apply the label to the PR
curl -s -X POST "$PR_LABELS_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg label "$LABEL_NAME" '[$label]')"

echo "Label '$LABEL_NAME' applied to PR #$PR_NUMBER"
