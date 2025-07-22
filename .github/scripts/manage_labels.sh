#!/bin/bash

LABEL_NAME=$1
LABEL_COLOR=$2

LABEL_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/labels/$LABEL_NAME"

curl -s -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/labels" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$LABEL_NAME" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')"

# pwd
# ls -al
echo "Hello...."

# bash ./.github/scripts/remove_labels.sh sonarqube_failed sonarqube_passed
