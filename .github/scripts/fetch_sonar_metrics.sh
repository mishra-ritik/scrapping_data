#!/bin/bash

echo "Fetching SonarQube metrics..."
RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" \
  "${SONAR_HOST_URL}/api/measures/component?component=buzz-api-main_new&metricKeys=alert_status,new_violations,new_duplicated_lines_density,new_security_hotspots")

echo "SonarQube raw response $RESPONSE"

ALERT_STATUS=$(echo "$RESPONSE" | jq -r '.component.measures[] | select(.metric=="alert_status") | .value // "UNKNOWN"')
NEW_ISSUES=$(echo "$RESPONSE" | jq -r '.component.measures[] | select(.metric=="new_violations") | .period.value // "0"')
DUPLICATIONS=$(echo "$RESPONSE" | jq -r '.component.measures[] | select(.metric=="new_duplicated_lines_density") | .period.value // "0.0"')
SECURITY_HOTSPOTS=$(echo "$RESPONSE" | jq -r '.component.measures[] | select(.metric=="new_security_hotspots") | .period.value // "0"')

echo "ALERT_STATUS=$ALERT_STATUS" >> $GITHUB_ENV
echo "NEW_ISSUES=$NEW_ISSUES" >> $GITHUB_ENV
echo "DUPLICATIONS=$DUPLICATIONS" >> $GITHUB_ENV
echo "SECURITY_HOTSPOTS=$SECURITY_HOTSPOTS" >> $GITHUB_ENV
