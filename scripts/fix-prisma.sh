#!/bin/bash

# Script to fix Prisma installation issues
set -e

echo "🔧 Fixing Prisma installation issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to install dependencies with retry
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Try different installation strategies
    if npm ci --no-optional; then
        print_status "✅ Dependencies installed successfully with --no-optional"
        return 0
    fi
    
    print_warning "First attempt failed, trying without --no-optional..."
    if npm ci; then
        print_status "✅ Dependencies installed successfully"
        return 0
    fi
    
    print_warning "Second attempt failed, trying npm install..."
    if npm install; then
        print_status "✅ Dependencies installed successfully with npm install"
        return 0
    fi
    
    print_error "❌ All installation attempts failed"
    return 1
}

# Function to generate Prisma client with retry
generate_prisma() {
    print_status "Generating Prisma client..."
    
    # Try generating Prisma client multiple times
    for i in {1..3}; do
        print_status "Attempt $i of 3..."
        
        if npx prisma generate; then
            print_status "✅ Prisma client generated successfully"
            return 0
        fi
        
        print_warning "Attempt $i failed, waiting before retry..."
        sleep 5
    done
    
    print_error "❌ Failed to generate Prisma client after 3 attempts"
    return 1
}

# Function to clear npm cache
clear_cache() {
    print_status "Clearing npm cache..."
    npm cache clean --force
    print_status "✅ NPM cache cleared"
}

# Function to remove node_modules and reinstall
clean_install() {
    print_status "Performing clean installation..."
    
    # Remove node_modules and package-lock.json
    rm -rf node_modules package-lock.json
    
    # Clear cache
    clear_cache
    
    # Reinstall dependencies
    install_dependencies
    
    # Generate Prisma client
    generate_prisma
}

# Main script logic
main() {
    case "${1:-fix}" in
        "fix")
            print_status "Starting Prisma fix process..."
            
            # Try normal installation first
            if install_dependencies && generate_prisma; then
                print_status "✅ Prisma fix completed successfully"
                return 0
            fi
            
            # If normal installation fails, try clean install
            print_warning "Normal installation failed, trying clean install..."
            clean_install
            ;;
        "clean")
            print_status "Performing clean installation..."
            clean_install
            ;;
        "generate")
            print_status "Generating Prisma client only..."
            generate_prisma
            ;;
        "install")
            print_status "Installing dependencies only..."
            install_dependencies
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Usage: $0 [fix|clean|generate|install]"
            echo "  fix     - Try to fix Prisma issues (default)"
            echo "  clean   - Perform clean installation"
            echo "  generate - Generate Prisma client only"
            echo "  install  - Install dependencies only"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 