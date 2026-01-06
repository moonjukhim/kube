#!/bin/bash

# Docker image build script for Bank of Anthos
# Usage: ./build-images.sh [REGISTRY]

REGISTRY=${1:-"eks-gitops-demo"}
VERSION=${2:-"latest"}

AWS_REGION="us-west-2"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ECR_REGISTRY

#############################################################################

echo "Building Docker images with registry: $ERC_REGISTRY, version: $VERSION"

# Build Frontend
echo "Building frontend..."
docker build -t $ERC_REGISTRY/frontend:$VERSION ./frontend

# Build Python Services
echo "Building userservice..."
docker build -t $ERC_REGISTRY/userservice:$VERSION ./userservice

echo "Building contacts..."
docker build -t $ERC_REGISTRY/contacts:$VERSION ./contacts

# Build Java Services
echo "Building ledger-writer..."
docker build -t $ERC_REGISTRY/ledger-writer:$VERSION ./ledger-writer

echo "Building balance-reader..."
docker build -t $ERC_REGISTRY/balance-reader:$VERSION ./balance-reader

echo "Building transaction-history..."
docker build -t $ERC_REGISTRY/transaction-history:$VERSION ./transaction-history

echo "All images built successfully!"
echo ""
echo "Images:"
docker images | grep $ERC_REGISTRY

# Push to registry

docker push $ERC_REGISTRY/frontend:$VERSION
docker push $ERC_REGISTRY/userservice:$VERSION
docker push $ERC_REGISTRY/contacts:$VERSION 
docker push $ERC_REGISTRY/ledger-writer:$VERSION
docker push $ERC_REGISTRY/balance-reader:$VERSION 
docker push $ERC_REGISTRY/transaction-history:$VERSION