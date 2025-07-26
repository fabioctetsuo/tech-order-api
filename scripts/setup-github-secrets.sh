#!/bin/bash

# Script to set up GitHub secrets for Order API
set -e

echo "🔐 Setting up GitHub secrets for Order API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed"
        print_info "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if user is authenticated with GitHub CLI
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI"
        print_info "Please run: gh auth login"
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Function to get database credentials
get_database_credentials() {
    print_status "Getting database credentials..."
    
    # Check if database repository exists
    if [ ! -d "../tech-challenge-fiap-db" ]; then
        print_error "Database repository not found at ../tech-challenge-fiap-db"
        print_info "Please clone the database repository first:"
        echo "  git clone https://github.com/fabioctetsuo/tech-challenge-fiap-db.git ../tech-challenge-fiap-db"
        exit 1
    fi
    
    # Navigate to database repository
    cd ../tech-challenge-fiap-db
    
    # Check if Terraform is initialized
    if [ ! -f ".terraform/terraform.tfstate" ]; then
        print_error "Terraform state not found"
        print_info "Please run 'terraform init' and 'terraform apply' in the database repository first"
        exit 1
    fi
    
    # Get database credentials from Terraform outputs
    print_status "Extracting database credentials from Terraform..."
    
    # Get username from Terraform outputs
    DB_USERNAME=$(terraform output -raw orders_rds_username 2>/dev/null || echo "")
    
    # Get database name from Terraform outputs
    DB_NAME=$(terraform output -raw orders_rds_database_name 2>/dev/null || echo "")
    
    # For password, we need to get it from variables or prompt
    if [ -z "$DB_PASSWORD" ]; then
        read -s -p "Enter database password: " DB_PASSWORD
        echo
    fi
    
    if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        print_error "Database credentials are incomplete"
        print_info "Username: $DB_USERNAME"
        print_info "Database: $DB_NAME"
        print_info "Password: [HIDDEN]"
        exit 1
    fi
    
    # Go back to the original directory
    cd ../tech-order-api
    
    # Export the variables
    export DB_USERNAME
    export DB_PASSWORD
    export DB_NAME
    
    print_status "Database credentials retrieved successfully"
}

# Function to set GitHub secrets
set_github_secrets() {
    print_status "Setting GitHub secrets..."
    
    # Get the current repository name
    REPO_NAME=$(gh repo view --json name -q .name)
    print_info "Repository: $REPO_NAME"
    
    # Construct DATABASE_URL
    DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
    
    # Set secrets
    print_status "Setting DATABASE_URL secret..."
    echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo "$REPO_NAME"
    
    print_status "Setting RABBITMQ_URI secret..."
    RABBITMQ_URI="amqp://guest:guest@rabbitmq-service.orders-service.svc.cluster.local:5672"
    echo "$RABBITMQ_URI" | gh secret set RABBITMQ_URI --repo "$REPO_NAME"
    
    # Set RabbitMQ credentials
    print_status "Setting RabbitMQ credentials..."
    
    # Prompt for RabbitMQ credentials if not provided
    if [ -z "$RABBITMQ_USER" ]; then
        read -p "Enter RabbitMQ username (default: guest): " RABBITMQ_USER
        RABBITMQ_USER=${RABBITMQ_USER:-guest}
    fi
    
    if [ -z "$RABBITMQ_PASSWORD" ]; then
        read -s -p "Enter RabbitMQ password (default: guest): " RABBITMQ_PASSWORD
        echo
        RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD:-guest}
    fi
    
    print_status "Setting RABBITMQ_USER secret..."
    echo "$RABBITMQ_USER" | gh secret set RABBITMQ_USER --repo "$REPO_NAME"
    
    print_status "Setting RABBITMQ_PASSWORD secret..."
    echo "$RABBITMQ_PASSWORD" | gh secret set RABBITMQ_PASSWORD --repo "$REPO_NAME"
    
    print_status "GitHub secrets set successfully"
}

# Function to get database host
get_database_host() {
    print_status "Getting database host..."
    
    # Check if database repository exists
    if [ ! -d "../tech-challenge-fiap-db" ]; then
        print_error "Database repository not found at ../tech-challenge-fiap-db"
        exit 1
    fi
    
    # Navigate to database repository
    cd ../tech-challenge-fiap-db
    
    # Get database host from Terraform outputs
    DB_HOST=$(terraform output -raw orders_rds_endpoint 2>/dev/null || echo "")
    
    if [ -z "$DB_HOST" ]; then
        print_error "Could not retrieve database host from Terraform outputs"
        exit 1
    fi
    
    # Go back to the original directory
    cd ../tech-order-api
    
    export DB_HOST
    print_status "Database host: $DB_HOST"
}

# Main function
main() {
    print_status "Starting GitHub secrets setup for Order API..."
    
    # Check prerequisites
    check_prerequisites
    
    # Get database host
    get_database_host
    
    # Get database credentials
    get_database_credentials
    
    # Set GitHub secrets
    set_github_secrets
    
    print_status "🎉 GitHub secrets setup completed successfully!"
    
    print_info "Secrets set:"
    echo "  - DATABASE_URL"
    echo "  - RABBITMQ_URI"
    echo "  - RABBITMQ_USER"
    echo "  - RABBITMQ_PASSWORD"
    
    print_warning "Remember to also set these secrets manually in your CI/CD pipeline:"
    echo "  - DOCKER_IMAGE"
    echo "  - KUBECONFIG"
}

# Run main function
main "$@" 