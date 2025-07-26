# GitHub Actions Workflows

This directory contains the GitHub Actions workflows for the Order API service.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Trigger**: Push to `main` branch or Pull Request to `main`

**Jobs**:
- **Test**: Runs tests, linting, and builds the application
- **Build and Push**: Builds and pushes Docker image to Docker Hub
- **Deploy**: Deploys to Kubernetes cluster

**Features**:
- Automated testing and building
- Docker image building and pushing
- RabbitMQ deployment
- Database migration
- Kubernetes deployment
- Health checks and monitoring

### 2. Manual Deploy (`manual-deploy.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `docker_image`: Docker image to deploy
- `database_url`: Database URL (optional - will be retrieved from AWS RDS)
- `rabbitmq_uri`: RabbitMQ URI (optional - will use default)
- `environment`: Environment to deploy to (production/staging)
- `namespace`: Kubernetes namespace
- `replicas`: Number of replicas

**Features**:
- Manual deployment control
- Customizable deployment parameters
- RabbitMQ deployment
- Database migration
- Status reporting

### 3. Rollback (`rollback.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `namespace`: Kubernetes namespace
- `deployment_name`: Deployment name to rollback
- `revision`: Revision number to rollback to (optional)

**Features**:
- Rollback to previous or specific revision
- Deployment history display
- Status reporting

### 4. Scale (`scale.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `namespace`: Kubernetes namespace
- `deployment_name`: Deployment name to scale
- `replicas`: Number of replicas
- `rabbitmq_replicas`: Number of RabbitMQ replicas (optional)

**Features**:
- Scale Order API deployment
- Scale RabbitMQ deployment (optional)
- Status reporting

## Required Secrets

### AWS Credentials
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

### Docker Hub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_ACCESS_TOKEN`

### Database
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

## Usage

### Automatic Deployment
1. Push code to `main` branch
2. CI/CD pipeline will automatically:
   - Run tests
   - Build Docker image
   - Deploy to Kubernetes

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Manual Deploy to AWS"
3. Click "Run workflow"
4. Fill in the required parameters
5. Click "Run workflow"

### Rollback
1. Go to Actions tab in GitHub
2. Select "Rollback Deployment"
3. Click "Run workflow"
4. Fill in the required parameters
5. Click "Run workflow"

### Scaling
1. Go to Actions tab in GitHub
2. Select "Scale Deployment"
3. Click "Run workflow"
4. Fill in the required parameters
5. Click "Run workflow"

## Configuration

### Database Configuration
The workflows automatically retrieve database configuration from AWS RDS:
- Instance: `tech-challenge-orders-db`
- Region: `us-east-1`
- Credentials: From GitHub secrets

### RabbitMQ Configuration
- Default URI: `amqp://guest:guest@rabbitmq-service.orders-service.svc.cluster.local:5672`
- Credentials: `guest/guest` (should be changed in production)

### Kubernetes Configuration
- Cluster: `tech_challenge_cluster`
- Region: `us-east-1`
- Namespace: `orders-service`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify AWS credentials are set
   - Check if RDS instance exists
   - Verify database credentials in GitHub secrets

2. **RabbitMQ Connection Issues**
   - Check if RabbitMQ deployment is successful
   - Verify RabbitMQ URI format
   - Check RabbitMQ pod status

3. **Kubernetes Deployment Issues**
   - Verify cluster access
   - Check namespace exists
   - Verify Docker image exists

### Debugging

1. **Check Workflow Logs**
   - Go to Actions tab
   - Click on the workflow run
   - Check individual job logs

2. **Check Kubernetes Status**
   ```bash
   kubectl get pods -n orders-service
   kubectl get services -n orders-service
   kubectl get hpa -n orders-service
   ```

3. **Check Application Logs**
   ```bash
   kubectl logs -f deployment/tech-order-api -n orders-service
   kubectl logs -f deployment/rabbitmq -n orders-service
   ```

## Security Considerations

1. **Secrets Management**
   - All sensitive data is stored in GitHub secrets
   - Database credentials are externalized
   - AWS credentials use temporary tokens

2. **Network Security**
   - RDS is in private subnets
   - Kubernetes cluster has proper security groups
   - Inter-service communication is internal

3. **Access Control**
   - Workflows run with minimal required permissions
   - Manual workflows require explicit approval
   - Rollback and scaling require manual intervention

## Monitoring

### Health Checks
- Application health endpoint: `/health`
- Kubernetes readiness and liveness probes
- RabbitMQ TCP health checks

### Metrics
- Horizontal Pod Autoscaler (HPA) configured
- CPU and memory monitoring
- Pod status monitoring

### Logging
- Application logs via kubectl
- Workflow execution logs in GitHub Actions
- Consider centralized logging solution for production 