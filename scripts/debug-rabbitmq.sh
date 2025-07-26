#!/bin/bash

# Debug script for RabbitMQ deployment issues
set -e

NAMESPACE="orders-service"
POD_LABEL="app=rabbitmq"

echo "🔍 Debugging RabbitMQ deployment..."

# Check if namespace exists
echo "📋 Checking namespace..."
kubectl get namespace $NAMESPACE || echo "❌ Namespace $NAMESPACE does not exist!"

# Check PVC status
echo "📦 Checking PVC status..."
kubectl get pvc -n $NAMESPACE || echo "❌ No PVCs found in namespace $NAMESPACE"

# Check deployment status
echo "🚀 Checking deployment status..."
kubectl get deployment -n $NAMESPACE || echo "❌ No deployments found in namespace $NAMESPACE"

# Check pods
echo "🐳 Checking pods..."
kubectl get pods -n $NAMESPACE || echo "❌ No pods found in namespace $NAMESPACE"

# Get RabbitMQ pod name
POD_NAME=$(kubectl get pods -n $NAMESPACE -l $POD_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$POD_NAME" ]; then
    echo "📋 RabbitMQ pod name: $POD_NAME"
    
    # Get detailed pod information
    echo "🔍 Pod details:"
    kubectl describe pod $POD_NAME -n $NAMESPACE
    
    # Get pod logs
    echo "📝 Pod logs:"
    kubectl logs $POD_NAME -n $NAMESPACE --tail=50 || echo "❌ Could not retrieve logs"
    
    # Check pod events
    echo "📅 Pod events:"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep $POD_NAME || echo "❌ No events found for pod"
    
else
    echo "❌ No RabbitMQ pod found!"
fi

# Check cluster resources
echo "💾 Checking cluster resources..."
kubectl top nodes 2>/dev/null || echo "❌ Could not get node metrics (metrics-server might not be installed)"

# Check storage classes
echo "💿 Checking storage classes..."
kubectl get storageclass || echo "❌ Could not get storage classes"

# Check if RabbitMQ service is accessible
echo "🌐 Checking RabbitMQ service..."
kubectl get service -n $NAMESPACE || echo "❌ No services found in namespace $NAMESPACE"

echo "✅ Debug information collected!" 