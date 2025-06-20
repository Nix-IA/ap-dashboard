#!/bin/bash

echo "🧪 Testing Portainer redeploy for stack ID 30..."

# Test different endpoints
STACK_ID=30
API_KEY="ptr_5uIDyNgV9X5I2FEOaQVEjKJQ5pKB/s6g"
BASE_URL="https://portainer.agentpay.com.br/api"

echo ""
echo "1. Testing GET stack info:"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "X-API-Key: $API_KEY" \
  "$BASE_URL/stacks/$STACK_ID"

echo ""
echo "2. Testing POST redeploy:"
curl -s -w "HTTP Status: %{http_code}\n" \
  -X POST \
  -H "X-API-Key: $API_KEY" \
  "$BASE_URL/stacks/$STACK_ID/redeploy"

echo ""
echo "3. Testing POST start:"
curl -s -w "HTTP Status: %{http_code}\n" \
  -X POST \
  -H "X-API-Key: $API_KEY" \
  "$BASE_URL/stacks/$STACK_ID/start"

echo ""
echo "4. Testing PUT update (with pullImage):"
curl -s -w "HTTP Status: %{http_code}\n" \
  -X PUT \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pullImage":true}' \
  "$BASE_URL/stacks/$STACK_ID"

echo ""
echo "✅ Test completed!"
