#!/bin/bash

# Fridge to Feast - Google Cloud Platform Deployment Script
# This script helps deploy the application to Google Cloud Platform

set -e  # Exit on any error

# Configuration
PROJECT_ID=${PROJECT_ID:-"your-gcp-project-id"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"fridge-to-feast"}
IMAGE_NAME=${IMAGE_NAME:-"gcr.io/$PROJECT_ID/$SERVICE_NAME"}
TAG=${TAG:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud SDK (gcloud) is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Authenticate with Google Cloud
authenticate_gcp() {
    log_info "Authenticating with Google Cloud..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_warning "No active Google Cloud account found. Please authenticate."
        gcloud auth login
    else
        log_success "Already authenticated with Google Cloud"
    fi
    
    # Set the project
    gcloud config set project $PROJECT_ID
    log_success "Project set to: $PROJECT_ID"
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building Docker image..."
    
    # Build the image
    docker build -t $IMAGE_NAME:$TAG .
    log_success "Docker image built successfully"
    
    # Configure Docker to use gcloud as a credential helper
    log_info "Configuring Docker authentication..."
    gcloud auth configure-docker
    
    # Push the image to Google Container Registry
    log_info "Pushing image to Google Container Registry..."
    docker push $IMAGE_NAME:$TAG
    log_success "Image pushed successfully: $IMAGE_NAME:$TAG"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    log_info "Deploying to Cloud Run..."
    
    # Deploy the service
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME:$TAG \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 0 \
        --timeout 300 \
        --concurrency 80 \
        --set-env-vars NODE_ENV=production \
        --set-env-vars PORT=3000 \
        --set-env-vars HOSTNAME=0.0.0.0
    
    log_success "Deployment completed successfully"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    log_success "Service URL: $SERVICE_URL"
}

# Deploy to Google Kubernetes Engine (GKE) - Alternative deployment
deploy_to_gke() {
    log_info "Deploying to Google Kubernetes Engine..."
    
    # Create a Kubernetes deployment manifest
    cat > k8s-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $SERVICE_NAME
  labels:
    app: $SERVICE_NAME
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $SERVICE_NAME
  template:
    metadata:
      labels:
        app: $SERVICE_NAME
    spec:
      containers:
      - name: $SERVICE_NAME
        image: $IMAGE_NAME:$TAG
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: HOSTNAME
          value: "0.0.0.0"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $SERVICE_NAME-service
spec:
  selector:
    app: $SERVICE_NAME
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
EOF
    
    # Apply the deployment
    kubectl apply -f k8s-deployment.yaml
    log_success "GKE deployment completed"
}

# Main deployment function
main() {
    log_info "Starting Fridge to Feast deployment to Google Cloud Platform"
    
    # Check if PROJECT_ID is set
    if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
        log_error "Please set PROJECT_ID environment variable or update the script"
        log_info "Usage: PROJECT_ID=your-project-id ./deploy-gcp.sh"
        exit 1
    fi
    
    check_prerequisites
    authenticate_gcp
    build_and_push_image
    
    # Choose deployment method
    echo -e "${BLUE}Choose deployment method:${NC}"
    echo "1) Cloud Run (Recommended - Serverless)"
    echo "2) Google Kubernetes Engine (GKE)"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            deploy_to_cloud_run
            ;;
        2)
            deploy_to_gke
            ;;
        *)
            log_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
    log_info "Don't forget to set your environment variables in the Google Cloud Console:"
    log_info "- OPENAI_API_KEY"
    log_info "- GOOGLE_APPLICATION_CREDENTIALS (for image recognition)"
}

# Run the main function
main "$@" 