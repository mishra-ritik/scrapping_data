#!/bin/bash

set -e

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")
PREFIX=$1

echo "Looking for labels with prefix: $PREFIX"

LABELS=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels" \
  | jq -r '.[].name')

for label in $LABELS; do
  if [[ "$label" == "$PREFIX"* ]]; then
    echo "Removing label: $label"
    curl -s -X DELETE \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels/$(echo "$label" | jq -sRr @uri)" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}"
  fi
done
