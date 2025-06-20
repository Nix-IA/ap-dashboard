#!/bin/bash

echo "🚀 Triggering manual deploy to Portainer (V2)..."

# Default values
IMAGE_TAG="latest"
FORCE_PULL="true"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --no-pull)
      FORCE_PULL="false"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--tag IMAGE_TAG] [--no-pull]"
      echo ""
      echo "Options:"
      echo "  --tag IMAGE_TAG    Docker image tag to deploy (default: latest)"
      echo "  --no-pull         Don't force pull latest image (default: force pull)"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "📦 Image tag: $IMAGE_TAG"
echo "🔄 Force pull: $FORCE_PULL"

# Trigger the workflow
gh workflow run deploy-only-v2.yml \
  --field image_tag="$IMAGE_TAG" \
  --field force_pull="$FORCE_PULL"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deploy workflow triggered!"
  echo "🔍 Monitor the progress:"
  echo "   gh run list --workflow=deploy-only-v2.yml --limit=5"
  echo "   gh run watch"
  echo ""
  echo "🌐 Once deployed, check: https://<your-domain>"
  echo ""
  echo "💡 Available commands:"
  echo "   gh run list --workflow=deploy-only-v2.yml    # List deploy runs"
  echo "   gh run view <run-id>                         # View specific run"
  echo "   gh run view <run-id> --log                   # View logs"
else
  echo "❌ Failed to trigger workflow"
  exit 1
fi
