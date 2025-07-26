# Order API Kubernetes Deployment

This directory contains the Kubernetes configuration files for deploying the Order API service along with its dependencies (RabbitMQ and PostgreSQL).

## Architecture

The deployment includes:
- **Order API**: Main application service
- **RabbitMQ**: Message broker for async communication
- **PostgreSQL**: Database (external, managed by AWS RDS)

## Files Structure

```
k8s/
├── namespace.yaml                 # Kubernetes namespace
├── configmap.yaml                 # Non-sensitive configuration
├── secret.yaml                    # Sensitive configuration (DATABASE_URL, RABBITMQ_URI)
├── deployment.yaml.template       # Order API deployment template
├── service.yaml.template          # Order API service template
├── hpa.yaml                       # Horizontal Pod Autoscaler
├── migration-job.yaml             # Database migration job
├── rabbitmq-deployment.yaml       # RabbitMQ deployment
├── rabbitmq-service.yaml          # RabbitMQ service
├── rabbitmq-pvc.yaml              # RabbitMQ persistent volume claim
├── rabbitmq-secret.yaml           # RabbitMQ credentials
├── deploy.sh                      # Deployment script
└── README.md                      # This file
```

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKER_IMAGE` | Docker image for the Order API | `your-registry/tech-order-api:latest` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_URI` | RabbitMQ connection string | `amqp://guest:guest@rabbitmq-service.orders-service.svc.cluster.local:5672` |

### Configuration from ConfigMap

| Variable | Description | Value |
|----------|-------------|-------|
| `NODE_ENV` | Node.js environment | `production` |
| `SERVICE_PORT` | Service port | `3000` |
| `PRODUCT_API_URL` | Product API service URL | `http://tech-product-api-service.products-service.svc.cluster.local:3001` |
| `PAYMENT_API_URL` | Payment API service URL | `http://tech-payment-api-service.payment-service.svc.cluster.local:3002` |

## Deployment Steps

### 1. Prerequisites

- Kubernetes cluster with access to AWS EKS
- `kubectl` configured to access the cluster
- Docker image built and pushed to registry
- PostgreSQL database running (AWS RDS recommended)
- Terraform infrastructure deployed (for automatic DATABASE_URL retrieval)

### 2. Set Environment Variables

```bash
export DOCKER_IMAGE="your-registry/tech-order-api:latest"
export DATABASE_URL="postgresql://user:password@host:5432/order_db"
# Optional: Set custom RabbitMQ URI
export RABBITMQ_URI="amqp://guest:guest@rabbitmq-service.orders-service.svc.cluster.local:5672"
```

### 3. Run Deployment

```bash
# Make the script executable
chmod +x k8s/deploy.sh

# Run the deployment
./k8s/deploy.sh
```

The deployment script will:
1. Check environment variables
2. Deploy RabbitMQ with persistent storage
3. Create/update Kubernetes secrets
4. Run database migrations
5. Deploy the Order API application
6. Configure horizontal pod autoscaling

## Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy RabbitMQ
kubectl apply -f k8s/rabbitmq-secret.yaml
kubectl apply -f k8s/rabbitmq-pvc.yaml
kubectl apply -f k8s/rabbitmq-deployment.yaml
kubectl apply -f k8s/rabbitmq-service.yaml

# 3. Create secrets
kubectl create secret generic tech-order-api-secret \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=RABBITMQ_URI="$RABBITMQ_URI" \
  --namespace=orders-service

# 4. Apply configuration
kubectl apply -f k8s/configmap.yaml

# 5. Generate and apply deployment files
envsubst < k8s/deployment.yaml.template | kubectl apply -f -
envsubst < k8s/service.yaml.template | kubectl apply -f -

# 6. Apply HPA
kubectl apply -f k8s/hpa.yaml

# 7. Run migrations
envsubst < k8s/migration-job.yaml | kubectl apply -f -
```

## Monitoring and Troubleshooting

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n orders-service

# Check services
kubectl get services -n orders-service

# Check HPA
kubectl get hpa -n orders-service

# Check logs
kubectl logs -f deployment/tech-order-api -n orders-service
kubectl logs -f deployment/rabbitmq -n orders-service
```

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if database is accessible from the cluster
   - Ensure database security groups allow cluster access

2. **RabbitMQ Connection Issues**
   - Check RabbitMQ pod status
   - Verify RABBITMQ_URI format
   - Check RabbitMQ logs

3. **Migration Failures**
   - Check migration job logs: `kubectl logs job/tech-order-api-migration -n orders-service`
   - Verify database permissions
   - Check if migrations are compatible

## Scaling

The deployment includes Horizontal Pod Autoscaler (HPA) configured to:
- Scale between 2 and 10 replicas
- Scale based on CPU usage (70% threshold)
- Scale based on memory usage (80% threshold)

## Security

- Secrets are stored in Kubernetes secrets (base64 encoded)
- Database credentials are externalized
- RabbitMQ credentials are configurable
- Network policies can be added for additional security

## GitHub Secrets Setup

For CI/CD deployment, set these secrets in your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `DOCKER_IMAGE` | Docker image URL |
| `DATABASE_URL` | PostgreSQL connection string |
| `RABBITMQ_URI` | RabbitMQ connection string (optional) |
| `KUBECONFIG` | Base64 encoded kubeconfig file |

## Cleanup

To remove the deployment:

```bash
# Delete all resources in the namespace
kubectl delete namespace orders-service

# Or delete individual resources
kubectl delete -f k8s/ --namespace=orders-service
``` 