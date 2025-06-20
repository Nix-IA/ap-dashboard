#!/bin/bash

echo "🔗 Testing Portainer Webhook..."

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <webhook_id>"
    echo ""
    echo "Example: $0 c12a95e1-c3ab-43e6-bc43-cdb24eb56b10"
    echo ""
    echo "To find the webhook ID:"
    echo "1. Go to Portainer → Stacks → frontend"
    echo "2. Look for Webhook section"
    echo "3. Copy the webhook ID from the URL"
    exit 1
fi

WEBHOOK_ID="$1"
WEBHOOK_URL="https://portainer.agentpay.com.br/api/stacks/webhooks/$WEBHOOK_ID"

echo "📡 Testing webhook: $WEBHOOK_URL"

WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST \
  "$WEBHOOK_URL" \
  -o /tmp/webhook_test_response.txt)

echo ""
if [ "$WEBHOOK_RESPONSE" = "200" ]; then
    echo "✅ Webhook test successful!"
    echo "🔄 Portainer should be updating the stack now..."
    echo "🌐 Check the app at: https://app.agentpay.com.br"
else
    echo "❌ Webhook test failed!"
    echo "📊 HTTP Status: $WEBHOOK_RESPONSE"
    echo "📄 Response:"
    cat /tmp/webhook_test_response.txt 2>/dev/null || echo "No response body"
fi

# Clean up
rm -f /tmp/webhook_test_response.txt

echo ""
echo "💡 If this worked, you can update the scripts with:"
echo "   WEBHOOK_ID=$WEBHOOK_ID"
