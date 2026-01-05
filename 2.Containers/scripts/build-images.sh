#!/bin/bash

# Docker image build script for Bank of Anthos
# Usage: ./build-images.sh [REGISTRY]

REGISTRY=${1:-"bank-of-anthos"}
VERSION=${2:-"latest"}

echo "Building Docker images with registry: $REGISTRY, version: $VERSION"

# Build Frontend
echo "Building frontend..."
docker build -t $REGISTRY/frontend:$VERSION ./frontend

# Build Python Services
echo "Building userservice..."
docker build -t $REGISTRY/userservice:$VERSION ./userservice

echo "Building contacts..."
docker build -t $REGISTRY/contacts:$VERSION ./contacts

# Build Java Services
echo "Building ledger-writer..."
docker build -t $REGISTRY/ledger-writer:$VERSION ./ledger-writer

echo "Building balance-reader..."
docker build -t $REGISTRY/balance-reader:$VERSION ./balance-reader

echo "Building transaction-history..."
docker build -t $REGISTRY/transaction-history:$VERSION ./transaction-history

echo "All images built successfully!"
echo ""
echo "Images:"
docker images | grep $REGISTRY
