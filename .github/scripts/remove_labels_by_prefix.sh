#!/bin/bash



PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")
PREFIX=$1

LABELS=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels" \
  | jq -r '.[].name')

echo "Labels: $LABELS"
echo "Looking for labels with prefix: $PREFIX:"

IFS=$'\n' # Safely split by lines
for label in $LABELS; do
  echo "Checking label: '$label'"
  if [[ "$label" == *"$PREFIX"* ]]; then
    echo "Removing label: $label and $PREFIX--)"
    curl -s -X DELETE "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels/$label" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" || true
  else
    echo "Not Removing $label and $PREFIX--)"
  fi
done
