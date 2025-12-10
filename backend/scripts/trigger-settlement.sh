#!/bin/bash

# Script to trigger settlement on production API
# Usage: ./trigger-settlement.sh

API_URL="${1:-https://sports.tyler.bet/api}"

echo "Triggering settlement on $API_URL/settlement"
echo "You will need to provide authentication token..."
echo ""
read -p "Enter your JWT token: " TOKEN

echo ""
echo "Sending POST request to $API_URL/settlement..."

curl -X POST "$API_URL/settlement" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -v

echo ""
echo "Settlement request complete!"
