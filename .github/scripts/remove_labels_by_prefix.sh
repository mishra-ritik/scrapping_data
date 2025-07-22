#!/bin/bash

set -e

PR_NUMBER=$(jq --raw-output .pull_request.number "$GITHUB_EVENT_PATH")
PREFIX=$1

#if [[ -z "$PREFIX" ]]; then
#  echo "ERROR: Prefix argument is missing"
#  exit 1
#fi
#
#if [[ -z "$GITHUB_TOKEN" || -z "$GITHUB_REPOSITORY" ]]; then
#  echo "ERROR: Required environment variables not set"
#  exit 1
#fi
#
#echo "Found PR number: $PR_NUMBER"
#echo "Repository: $GITHUB_REPOSITORY"

LABELS=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels" \
  | jq -r '.[].name')

echo "Labels: $LABELS"
echo "Looking for labels with prefix: $PREFIX:"

IFS=$'\n' # Safely split by lines
for label in $LABELS; do
  echo "Checking label: '$label'"
  if [[ "$label" == *"$PREFIX"* ]]; then
    echo "Removing label:"
  else
    echo "Not Removing"
  fi
done
