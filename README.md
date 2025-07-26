# 🛒 Order Microservice

Order management microservice for handling customers and orders.

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Deployment
```bash
# Full deployment (build, start, migrate, health check)
./deploy.sh

# Or step by step
./deploy.sh build    # Build Docker image
./deploy.sh start    # Start services
./deploy.sh migrate  # Run database migrations
./deploy.sh health   # Check service health
```

### Manual Start
```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec order-api npx prisma migrate deploy

# Check health
curl http://localhost:3000/health
```

## 📋 Available Commands

```bash
./deploy.sh deploy   # Full deployment
./deploy.sh start    # Start services only
./deploy.sh stop     # Stop services
./deploy.sh restart  # Restart services
./deploy.sh logs     # Show service logs
./deploy.sh build    # Build Docker image only
./deploy.sh migrate  # Run database migrations only
./deploy.sh health   # Check service health only
```

## 🌐 Service URLs

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Swagger Docs**: http://localhost:3000/api
- **Database**: localhost:5432
- **RabbitMQ Management**: http://localhost:15672

## 🗄️ Database

- **Database**: `order_db`
- **Tables**: `cliente`, `pedido`, `item_pedido`

## 📡 API Endpoints

### Customers
- `GET /clientes` - List all customers
- `POST /clientes` - Create new customer
- `GET /clientes/:id` - Get customer by ID
- `PUT /clientes/:id` - Update customer
- `DELETE /clientes/:id` - Delete customer

### Orders
- `GET /pedidos` - List all orders
- `POST /pedidos` - Create new order
- `GET /pedidos/:id` - Get order by ID
- `PUT /pedidos/:id/confirmar` - Confirm order
- `PUT /pedidos/:id/receber` - Receive confirmed order
- `PUT /pedidos/:id/preparar` - Start preparing order
- `PUT /pedidos/:id/pronto` - Mark order as ready
- `PUT /pedidos/:id/entregue` - Mark order as delivered

## 🔧 Environment Variables

```bash
DATABASE_URL=postgresql://postgres:password@order-postgres:5432/order_db
PRODUCT_API_URL=http://localhost:3001
PAYMENT_API_URL=http://localhost:3002
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
```

## 🐰 RabbitMQ Messaging

The order service uses RabbitMQ for asynchronous messaging to notify other services about order status changes.

### Queues and Exchanges
- **Exchange**: `pedido.exchange` (topic)
- **Queues**:
  - `pedido.confirmado` - Order confirmed
  - `pedido.recebido` - Order received
  - `pedido.preparacao` - Order in preparation
  - `pedido.pronto` - Order ready
  - `pedido.entregue` - Order delivered

### Message Publishing
The service automatically publishes messages when order status changes:
- Order confirmation triggers `pedido.confirmado` message
- Order reception triggers `pedido.recebido` message
- Preparation start triggers `pedido.preparacao` message
- Order ready triggers `pedido.pronto` message
- Order delivery triggers `pedido.entregue` message

### Message Consumers
The service includes consumers that process incoming messages and can trigger additional business logic.

### RabbitMQ Management
Access the RabbitMQ management interface at http://localhost:15672 with default credentials:
- **Username**: guest
- **Password**: guest

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Run migrations
npm run migrate:dev

# Open Prisma Studio
npm run prisma:studio
```

### Database Management
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## 📦 Docker

### Build Image
```bash
docker build -f Dockerfile.dev -t tech-order-api:dev .
```

### Run Container
```bash
docker run -p 3000:3000 tech-order-api:dev
```

## 🔍 Monitoring

- **Health Check**: `/health`
- **Logs**: `docker-compose logs -f order-api`
- **Database**: Connect to `localhost:5432` with `order_db`

## 🚨 Troubleshooting

### Service Not Starting
```bash
# Check logs
docker-compose logs order-api

# Check database connection
docker-compose exec order-postgres psql -U postgres -d order_db
```

### Migration Issues
```bash
# Reset database
docker-compose exec order-api npx prisma migrate reset

# Check migration status
docker-compose exec order-api npx prisma migrate status
```

### Port Conflicts
If port 3000 or 5432 is already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - '3001:3000'  # Change 3000 to 3001
``` 