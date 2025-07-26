#!/bin/bash

# Order Microservice Deployment Script
set -e

echo "🚀 Starting Order Microservice Deployment..."

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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_status "All prerequisites are satisfied"
}

# Build Docker image
build_image() {
    print_status "Building Order API Docker image..."
    docker-compose build
    print_status "Image built successfully"
}

# Start services
start_services() {
    print_status "Starting Order microservice..."
    docker-compose up -d
    print_status "Services started successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    docker-compose exec order-api npx prisma generate
    
    # Run migrations
    print_status "Running Order API migrations..."
    docker-compose exec order-api npx prisma migrate deploy
    
    print_status "Migrations completed successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check Order API health
    if curl -f -s "http://localhost:3000/health" > /dev/null; then
        print_status "✅ Order API is healthy"
    else
        print_error "❌ Order API is not responding"
    fi
    
    # Check RabbitMQ health
    check_rabbitmq_health
    
    # Check PostgreSQL health
    check_postgres_health
}

# Check RabbitMQ health
check_rabbitmq_health() {
    print_status "Checking RabbitMQ health..."
    
    # Check if RabbitMQ container is running
    if docker ps --format "table {{.Names}}" | grep -q "order-rabbitmq"; then
        print_status "✅ RabbitMQ container is running"
    else
        print_error "❌ RabbitMQ container is not running"
        return 1
    fi
    
    # Check RabbitMQ management API
    if curl -f -s "http://localhost:15672/api/overview" > /dev/null; then
        print_status "✅ RabbitMQ management API is accessible"
    else
        print_warning "⚠️  RabbitMQ management API is not accessible"
    fi
    
    # Check RabbitMQ connection from Order API
    if docker-compose exec order-api node -e "
        const amqp = require('amqplib');
        const uri = process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672';
        
        amqp.connect(uri)
            .then(conn => {
                console.log('✅ RabbitMQ connection successful');
                return conn.close();
            })
            .catch(err => {
                console.error('❌ RabbitMQ connection failed:', err.message);
                process.exit(1);
            });
    " 2>/dev/null; then
        print_status "✅ RabbitMQ connection from Order API is working"
    else
        print_error "❌ RabbitMQ connection from Order API failed"
    fi
}

# Check PostgreSQL health
check_postgres_health() {
    print_status "Checking PostgreSQL health..."
    
    # Check if PostgreSQL container is running
    if docker ps --format "table {{.Names}}" | grep -q "order-postgres"; then
        print_status "✅ PostgreSQL container is running"
    else
        print_error "❌ PostgreSQL container is not running"
        return 1
    fi
    
    # Check PostgreSQL connection
    if docker-compose exec order-postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_status "✅ PostgreSQL is ready to accept connections"
    else
        print_error "❌ PostgreSQL is not ready"
    fi
}

# Show service URLs
show_urls() {
    echo ""
    print_status "🎉 Order Microservice is running!"
    echo ""
    echo "Service URLs:"
    echo "  📦 Order API:      http://localhost:3000"
    echo "  🗄️  Order Database: localhost:5432"
    echo "  🐰 RabbitMQ:       amqp://localhost:5672"
    echo ""
    echo "Management Interfaces:"
    echo "  🐰 RabbitMQ Management: http://localhost:15672"
    echo "    Username: guest (default)"
    echo "    Password: guest (default)"
    echo ""
    echo "Health Check:"
    echo "  Order API:      http://localhost:3000/health"
    echo "  Swagger Docs:   http://localhost:3000/api"
    echo ""
}

# Stop services
stop_services() {
    print_status "Stopping Order microservice..."
    docker-compose down
    print_status "Services stopped successfully"
}

# Show logs
show_logs() {
    print_status "Showing service logs..."
    docker-compose logs -f
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        build_image
        start_services
        run_migrations
        check_health
        show_urls
        ;;
    "start")
        start_services
        show_urls
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        show_urls
        ;;
    "logs")
        show_logs
        ;;
    "build")
        check_prerequisites
        build_image
        ;;
    "migrate")
        run_migrations
        ;;
    "health")
        check_health
        ;;
    "rabbitmq")
        check_rabbitmq_health
        ;;
    "postgres")
        check_postgres_health
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|logs|build|migrate|health|rabbitmq|postgres}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (build, start, migrate, health check)"
        echo "  start    - Start services only"
        echo "  stop     - Stop services"
        echo "  restart  - Restart services"
        echo "  logs     - Show service logs"
        echo "  build    - Build Docker image only"
        echo "  migrate  - Run database migrations only"
        echo "  health   - Check all service health"
        echo "  rabbitmq - Check RabbitMQ health only"
        echo "  postgres - Check PostgreSQL health only"
        exit 1
        ;;
esac 