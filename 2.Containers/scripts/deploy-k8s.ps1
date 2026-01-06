# Kubernetes deployment script for Bank of Anthos (PowerShell)
# Usage: .\deploy-k8s.ps1

Write-Host "Deploying Bank of Anthos to Kubernetes..." -ForegroundColor Cyan

# Apply all manifests using kustomize
Write-Host "`nApplying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -k ./k8s

Write-Host "`nWaiting for deployments to be ready..." -ForegroundColor Yellow

# Wait for databases first
kubectl wait --for=condition=ready pod -l app=accounts-db -n bank-of-anthos --timeout=120s
kubectl wait --for=condition=ready pod -l app=ledger-db -n bank-of-anthos --timeout=120s

# Wait for services
kubectl wait --for=condition=ready pod -l app=userservice -n bank-of-anthos --timeout=120s
kubectl wait --for=condition=ready pod -l app=contacts -n bank-of-anthos --timeout=120s
kubectl wait --for=condition=ready pod -l app=ledger-writer -n bank-of-anthos --timeout=180s
kubectl wait --for=condition=ready pod -l app=balance-reader -n bank-of-anthos --timeout=180s
kubectl wait --for=condition=ready pod -l app=transaction-history -n bank-of-anthos --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend -n bank-of-anthos --timeout=120s

Write-Host "`nDeployment completed!" -ForegroundColor Green

Write-Host "`nPod Status:" -ForegroundColor Cyan
kubectl get pods -n bank-of-anthos

Write-Host "`nServices:" -ForegroundColor Cyan
kubectl get svc -n bank-of-anthos

Write-Host "`nFrontend URL:" -ForegroundColor Yellow
kubectl get svc frontend -n bank-of-anthos -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

