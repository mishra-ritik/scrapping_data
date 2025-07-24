#!/bin/bash

set -e

LABEL_PREFIX=$1    
LABEL_VALUE=$2     
LABEL_COLOR=$3     

FINAL_LABEL="${LABEL_PREFIX}:${LABEL_VALUE}"

echo "Managing label: $FINAL_LABEL with color: $LABEL_COLOR"

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")


echo "Fetching and removing existing labels with prefix: $LABEL_PREFIX"

LABELS=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels" \
  | jq -r '.[].name')

IFS=$'\n'
for label in $LABELS; do
  if [[ "$label" == "$LABEL_PREFIX:"* ]]; then
    echo "Removing label: $label"
    curl -s -X DELETE \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels/$label" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" || true
  fi
done


LABEL_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/labels"
PR_LABELS_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels"

curl -s -X POST "$LABEL_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$FINAL_LABEL" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')" || true

curl -s -X POST "$PR_LABELS_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg label "$FINAL_LABEL" '[$label]')"

echo "Applied label: $FINAL_LABEL to PR #$PR_NUMBER"
