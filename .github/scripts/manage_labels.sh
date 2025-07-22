#!/bin/bash

LABEL_NAME=$1
LABEL_COLOR=$2

LABEL_API_URL="https://api.github.com/repos/${GITHUB_REPOSITORY}/labels/$LABEL_NAME"

# Try PATCH first, if fails, use POST
curl -s -X PATCH "$LABEL_API_URL" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$LABEL_NAME" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')" \
|| \
curl -s -X POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/labels" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg name "$LABEL_NAME" --arg color "$LABEL_COLOR" '{name: $name, color: $color}')"
