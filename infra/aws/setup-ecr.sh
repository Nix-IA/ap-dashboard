#!/bin/bash

# AWS ECR Setup Script for AP Dashboard
# This script creates and configures ECR repository for the frontend

set -e

echo "🚀 AP Dashboard - AWS ECR Setup"
echo "==============================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo "Please install it first: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if user is authenticated
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ You are not authenticated with AWS CLI."
    echo "Please run: aws configure"
    exit 1
fi

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "📊 AWS Configuration"
echo "===================="
echo "Account ID: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo ""

# Repository name
REPOSITORY_NAME="ap-dashboard-frontend"

echo "🗃️ Creating ECR Repository"
echo "=========================="

# Check if repository already exists
if aws ecr describe-repositories --repository-names $REPOSITORY_NAME --region $AWS_REGION &> /dev/null; then
    echo "✅ Repository '$REPOSITORY_NAME' already exists"
else
    echo "Creating repository '$REPOSITORY_NAME'..."
    
    aws ecr create-repository \
        --repository-name $REPOSITORY_NAME \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
    
    echo "✅ Repository '$REPOSITORY_NAME' created successfully"
fi

# Set lifecycle policy
echo ""
echo "📋 Setting Lifecycle Policy"
echo "=========================="

LIFECYCLE_POLICY='{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 production images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["latest", "main"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep untagged images for 1 day",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 1
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}'

echo "$LIFECYCLE_POLICY" | aws ecr put-lifecycle-policy \
    --repository-name $REPOSITORY_NAME \
    --region $AWS_REGION \
    --lifecycle-policy-text file:///dev/stdin

echo "✅ Lifecycle policy configured"

# Set repository policy for cross-account access if needed
echo ""
echo "🔒 Repository Information"
echo "======================="
REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY_NAME"
echo "Repository URI: $REPOSITORY_URI"
echo ""

echo "🔐 Required GitHub Secrets"
echo "========================="
echo "Add these secrets to your GitHub repository:"
echo ""
echo "AWS_ACCESS_KEY_ID=your-access-key-id"
echo "AWS_SECRET_ACCESS_KEY=your-secret-access-key"
echo ""
echo "💡 To create AWS access keys:"
echo "1. Go to AWS Console → IAM → Users → Your User"
echo "2. Go to 'Security credentials' tab"
echo "3. Click 'Create access key'"
echo "4. Choose 'Command Line Interface (CLI)'"
echo "5. Copy the Access Key ID and Secret Access Key"
echo ""

echo "📝 Update your .env file in Portainer:"
echo "======================================"
echo "FRONTEND_IMAGE=$REPOSITORY_URI"
echo "FRONTEND_TAG=latest"
echo ""

echo "🎉 ECR Setup completed!"
echo ""
echo "Next steps:"
echo "1. Add AWS secrets to GitHub: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
echo "2. Update Portainer stack environment variables"
echo "3. Test the pipeline by pushing to main branch"
echo ""
echo "📚 For more details, see: CI_CD_SETUP.md"
