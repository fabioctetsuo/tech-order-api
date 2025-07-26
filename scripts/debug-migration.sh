#!/bin/bash

# Debug script for migration job issues
set -e

NAMESPACE="orders-service"
JOB_NAME="tech-order-api-migration"

echo "🔍 Debugging migration job issues..."

# Check if namespace exists
echo "📋 Checking namespace..."
kubectl get namespace $NAMESPACE || echo "❌ Namespace $NAMESPACE does not exist!"

# Check job status
echo "🚀 Checking job status..."
kubectl get job $JOB_NAME -n $NAMESPACE || echo "❌ Job $JOB_NAME not found!"

# Check job description
echo "📋 Job description:"
kubectl describe job $JOB_NAME -n $NAMESPACE || echo "❌ Could not describe job"

# Check pods
echo "🐳 Checking migration pods..."
kubectl get pods -n $NAMESPACE -l job-name=$JOB_NAME || echo "❌ No migration pods found"

# Get pod details
POD_NAME=$(kubectl get pods -n $NAMESPACE -l job-name=$JOB_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$POD_NAME" ]; then
    echo "📋 Migration pod: $POD_NAME"
    
    # Get detailed pod information
    echo "🔍 Pod details:"
    kubectl describe pod $POD_NAME -n $NAMESPACE
    
    # Get pod logs
    echo "📝 Pod logs:"
    kubectl logs $POD_NAME -n $NAMESPACE --tail=100 || echo "❌ Could not retrieve logs"
    
    # Check pod events
    echo "📅 Pod events:"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep $POD_NAME || echo "❌ No events found for pod"
    
else
    echo "❌ No migration pod found!"
fi

# Check secrets
echo "🔐 Checking secrets..."
kubectl get secret tech-order-api-secret -n $NAMESPACE || echo "❌ Secret not found"

# Check if database URL is set
echo "🔍 Checking database URL in secret..."
kubectl get secret tech-order-api-secret -n $NAMESPACE -o jsonpath='{.data.DATABASE_URL}' | base64 -d | head -c 50 || echo "❌ Could not retrieve database URL"

# Check recent events
echo "📅 Recent events in namespace:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20 || echo "❌ No events found"

echo "✅ Debug information collected!" 