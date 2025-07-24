#!/bin/bash

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")
LABELS_TO_REMOVE=("$@")

for label in "${LABELS_TO_REMOVE[@]}"; do
  echo "Removing label: $label"
  curl -s -X DELETE "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels/$label" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" || true
done
