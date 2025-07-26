#!/bin/bash

# Order API Kubernetes Deployment Script
set -e

echo "🚀 Starting Order API Kubernetes Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$DOCKER_IMAGE" ]; then
        print_error "DOCKER_IMAGE environment variable is required"
        exit 1
    fi
    
    # If DATABASE_URL is not provided, try to get it from AWS RDS
    if [ -z "$DATABASE_URL" ]; then
        print_status "DATABASE_URL not provided, attempting to get it from AWS RDS..."
        
        # Check if we can access the database directory
        if [ -d "../tech-challenge-fiap-db" ]; then
            cd ../tech-challenge-fiap-db
            
            # Check if Terraform is initialized
            if [ -f ".terraform/terraform.tfstate" ]; then
                # Get the database URL from Terraform outputs
                DATABASE_URL=$(terraform output -raw orders_database_url 2>/dev/null || echo "")
                
                if [ -n "$DATABASE_URL" ]; then
                    print_status "✅ Database URL retrieved from AWS RDS"
                    export DATABASE_URL
                else
                    print_error "❌ Could not retrieve DATABASE_URL from AWS RDS"
                    print_error "Please set DATABASE_URL environment variable manually"
                    exit 1
                fi
                
                # Go back to the original directory
                cd ../tech-order-api
            else
                print_error "❌ Terraform state not found in tech-challenge-fiap-db"
                print_error "Please run 'terraform init' and 'terraform apply' in the database directory first"
                exit 1
            fi
        else
            print_error "❌ tech-challenge-fiap-db directory not found"
            print_error "Please set DATABASE_URL environment variable manually"
            exit 1
        fi
    fi
    
    # Set PRODUCT_API_URL if not provided
    if [ -z "$PRODUCT_API_URL" ]; then
        print_status "PRODUCT_API_URL not provided, attempting to get it from LoadBalancer service..."
        
        # Get the external IP from the products service LoadBalancer
        PRODUCT_EXTERNAL_IP=$(kubectl get svc products-service-loadbalancer -n products-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
        
        if [ -n "$PRODUCT_EXTERNAL_IP" ]; then
            PRODUCT_API_URL="http://${PRODUCT_EXTERNAL_IP}:3001"
            print_status "✅ Product API URL retrieved from LoadBalancer: $PRODUCT_API_URL"
            export PRODUCT_API_URL
        else
            print_warning "⚠️  Product service LoadBalancer external IP not available yet"
            print_warning "The service might still be provisioning. Using internal service URL as fallback."
            PRODUCT_API_URL="http://products-service-loadbalancer.products-service.svc.cluster.local:3001"
            export PRODUCT_API_URL
        fi
    fi
    
    # Set PAYMENT_API_URL if not provided
    if [ -z "$PAYMENT_API_URL" ]; then
        print_status "PAYMENT_API_URL not provided, attempting to get it from LoadBalancer service..."
        
        # Get the external IP from the payment service LoadBalancer
        PAYMENT_EXTERNAL_IP=$(kubectl get svc payment-service-loadbalancer -n payment-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
        
        if [ -n "$PAYMENT_EXTERNAL_IP" ]; then
            PAYMENT_API_URL="http://${PAYMENT_EXTERNAL_IP}:3003"
            print_status "✅ Payment API URL retrieved from LoadBalancer: $PAYMENT_API_URL"
            export PAYMENT_API_URL
        else
            print_warning "⚠️  Payment service LoadBalancer external IP not available yet"
            print_warning "The service might still be provisioning. Using internal service URL as fallback."
            PAYMENT_API_URL="http://payment-service-loadbalancer.payment-service.svc.cluster.local:3003"
            export PAYMENT_API_URL
        fi
    fi
    
    # Set RabbitMQ URI if not provided
    if [ -z "$RABBITMQ_URI" ]; then
        # Use RabbitMQ credentials from environment variables if available
        if [ -n "$RABBITMQ_USER" ] && [ -n "$RABBITMQ_PASSWORD" ]; then
            RABBITMQ_URI="amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq-service.orders-service.svc.cluster.local:5672"
            print_status "Using RabbitMQ URI with environment credentials: $RABBITMQ_URI"
        else
            RABBITMQ_URI="amqp://guest:guest@rabbitmq-service.orders-service.svc.cluster.local:5672"
            print_status "Using default RabbitMQ URI: $RABBITMQ_URI"
        fi
        export RABBITMQ_URI
    fi
    
    print_status "Environment variables are set"
}

# Create or update the secret with database URL and RabbitMQ URI
update_secret() {
    print_status "Updating Kubernetes secret..."
    
    # Create or update the secret
    kubectl create secret generic tech-order-api-secret \
        --from-literal=DATABASE_URL="$DATABASE_URL" \
        --from-literal=RABBITMQ_URI="$RABBITMQ_URI" \
        --from-literal=PRODUCT_API_URL="$PRODUCT_API_URL" \
        --from-literal=PAYMENT_API_URL="$PAYMENT_API_URL" \
        --namespace=orders-service \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_status "Secret updated successfully"
}

# Deploy RabbitMQ
deploy_rabbitmq() {
    print_status "Deploying RabbitMQ..."
    
    # Check if RabbitMQ credentials are provided via environment variables
    if [ -n "$RABBITMQ_USER" ] && [ -n "$RABBITMQ_PASSWORD" ]; then
        print_status "Using RabbitMQ credentials from environment variables..."
        
        # Base64 encode the RabbitMQ credentials
        RABBITMQ_USER_B64=$(echo -n "$RABBITMQ_USER" | base64)
        RABBITMQ_PASSWORD_B64=$(echo -n "$RABBITMQ_PASSWORD" | base64)
        
        # Generate RabbitMQ secret with environment variables
        export RABBITMQ_USER_B64
        export RABBITMQ_PASSWORD_B64
        envsubst < k8s/rabbitmq-secret.yaml > k8s/rabbitmq-secret-generated.yaml
        
        # Apply RabbitMQ resources
        kubectl apply -f k8s/rabbitmq-secret-generated.yaml
    else
        print_warning "RABBITMQ_USER and RABBITMQ_PASSWORD not set, using default credentials..."
        print_warning "For production, set these environment variables or use GitHub secrets"
        
        # Use default credentials (base64 encoded "guest")
        RABBITMQ_USER_B64="Z3Vlc3Q="
        RABBITMQ_PASSWORD_B64="Z3Vlc3Q="
        
        export RABBITMQ_USER_B64
        export RABBITMQ_PASSWORD_B64
        envsubst < k8s/rabbitmq-secret.yaml > k8s/rabbitmq-secret-generated.yaml
        
        kubectl apply -f k8s/rabbitmq-secret-generated.yaml
    fi
    
    kubectl apply -f k8s/rabbitmq-pvc.yaml
    kubectl apply -f k8s/rabbitmq-deployment.yaml
    kubectl apply -f k8s/rabbitmq-service.yaml
    
    # Wait for RabbitMQ to be ready
    print_status "Waiting for RabbitMQ to be ready..."
    kubectl wait --for=condition=ready pod -l app=rabbitmq -n orders-service --timeout=300s
    
    print_status "RabbitMQ deployed successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Generate migration job manifest
    envsubst < k8s/migration-job.yaml > k8s/migration-job-generated.yaml
    
    # Apply migration job
    kubectl apply -f k8s/migration-job-generated.yaml
    
    # Wait for migration job to complete
    print_status "Waiting for migration job to complete..."
    kubectl wait --for=condition=complete job/tech-order-api-migration -n orders-service --timeout=300s
    
    # Check migration job status
    MIGRATION_STATUS=$(kubectl get job tech-order-api-migration -n orders-service -o jsonpath='{.status.conditions[0].type}')
    
    if [ "$MIGRATION_STATUS" = "Complete" ]; then
        print_status "✅ Database migrations completed successfully"
    else
        print_error "❌ Database migrations failed"
        kubectl logs job/tech-order-api-migration -n orders-service
        exit 1
    fi
    
    # Clean up migration job
    kubectl delete job tech-order-api-migration -n orders-service
}

# Deploy the application
deploy_application() {
    print_status "Deploying Order API application..."
    
    # Apply namespace and config
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    
    # Generate deployment and service manifests
    envsubst < k8s/deployment.yaml.template > k8s/deployment-generated.yaml
    envsubst < k8s/service.yaml.template > k8s/service-generated.yaml
    
    # Apply deployment and service
    kubectl apply -f k8s/deployment-generated.yaml
    kubectl apply -f k8s/service-generated.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # Wait for deployment to be ready
    print_status "Waiting for Order API deployment to be ready..."
    kubectl wait --for=condition=available deployment/tech-order-api -n orders-service --timeout=300s
    
    print_status "✅ Order API deployed successfully"
}

# Main deployment function
main() {
    print_status "Starting Order API deployment process..."
    
    # Check environment
    check_environment
    
    # Update secrets
    update_secret
    
    # Deploy RabbitMQ first
    deploy_rabbitmq
    
    # Run migrations
    run_migrations
    
    # Deploy application
    deploy_application
    
    print_status "🎉 Order API deployment completed successfully!"
    
    # Show deployment status
    print_status "Deployment Status:"
    kubectl get pods -n orders-service
    kubectl get services -n orders-service
    kubectl get hpa -n orders-service
}

# Run main function
main "$@" 