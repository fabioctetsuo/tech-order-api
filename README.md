# Tech Order API

A NestJS-based microservice for handling orders in the tech challenge system.

## Features

- RESTful API for order management
- Integration with PostgreSQL database
- RabbitMQ messaging for async communication
- Kubernetes deployment ready
- Health checks and monitoring

## Prerequisites

- Node.js 22+
- Docker
- Kubernetes cluster (EKS recommended)
- PostgreSQL database
- RabbitMQ

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
RABBITMQ_URI=amqp://username:password@host:port
```

### 3. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 4. GitHub Secrets Setup

For CI/CD deployment, you need to set up GitHub secrets. Run the setup script:

```bash
./scripts/setup-github-secrets.sh
```

This will set up the following secrets:
- `DATABASE_URL` - PostgreSQL connection string
- `RABBITMQ_URI` - RabbitMQ connection string
- `RABBITMQ_USER` - RabbitMQ username
- `RABBITMQ_PASSWORD` - RabbitMQ password

Alternatively, you can set them manually in your GitHub repository settings:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `RABBITMQ_USER` (e.g., "guest")
   - `RABBITMQ_PASSWORD` (e.g., "guest")

### 5. Local Development

```bash
# Start the application
npm run start:dev

# Or with Docker
docker-compose up
```

## Deployment

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
./k8s/deploy.sh
```

### Manual Deployment

```bash
# Set environment variables
export DOCKER_IMAGE=your-registry/tech-order-api:latest
export DATABASE_URL=your-database-url
export RABBITMQ_USER=your-rabbitmq-user
export RABBITMQ_PASSWORD=your-rabbitmq-password

# Deploy
./k8s/deploy.sh
```

## API Endpoints

- `GET /health` - Health check
- `POST /clientes` - Create a new client
- `GET /clientes/:cpf` - Get client by CPF
- `POST /pedidos` - Create a new order
- `GET /pedidos` - List all orders
- `GET /pedidos/:id` - Get order by ID

## Architecture

The application follows a clean architecture pattern with:

- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases and DTOs
- **Infrastructure Layer**: External services, database, messaging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request 