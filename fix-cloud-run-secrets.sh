#!/bin/bash

# Fix Cloud Run Secrets Script
# This script helps clean up old secrets and set up new ones for the FridgeToFeast app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="fridgefeast-466610"
SERVICE_NAME="fridge-feast-next-app"
REGION="us-central1"

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

# Function to check if a secret exists
secret_exists() {
    local secret_name=$1
    gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1
}

# Function to create a secret if it doesn't exist
create_secret_if_missing() {
    local secret_name=$1
    local secret_value=$2
    
    if ! secret_exists "$secret_name"; then
        log_info "Creating secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" --project="$PROJECT_ID" --data-file=-
        log_success "Secret $secret_name created successfully"
    else
        log_info "Secret $secret_name already exists"
    fi
}

# Function to update a secret
update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if secret_exists "$secret_name"; then
        log_info "Updating secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --project="$PROJECT_ID" --data-file=-
        log_success "Secret $secret_name updated successfully"
    else
        log_error "Secret $secret_name does not exist. Please create it first."
        return 1
    fi
}

# Function to remove environment variable from Cloud Run service
remove_env_var() {
    local env_var_name=$1
    
    log_info "Removing environment variable: $env_var_name from Cloud Run service"
    
    # Get current environment variables
    current_env=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format="value(spec.template.spec.containers[0].env[].name)" \
        --project="$PROJECT_ID" 2>/dev/null || echo "")
    
    if echo "$current_env" | grep -q "$env_var_name"; then
        # Remove the specific environment variable
        gcloud run services update "$SERVICE_NAME" \
            --region="$REGION" \
            --remove-env-vars="$env_var_name" \
            --project="$PROJECT_ID" \
            --quiet
        
        log_success "Removed environment variable: $env_var_name"
    else
        log_info "Environment variable $env_var_name not found in service"
    fi
}

# Main function
main() {
    log_info "Starting Cloud Run secrets cleanup and setup..."
    
    # Check if gcloud is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Please authenticate with gcloud first: gcloud auth login"
        exit 1
    fi
    
    # Check if project is set
    if [ "$(gcloud config get-value project 2>/dev/null)" != "$PROJECT_ID" ]; then
        log_warning "Setting project to $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    fi
    
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1) Quick fix: Create missing GOOGLE_VISION_API_KEY secret (temporary)"
    echo "2) Proper fix: Clean up old secrets and set up new ones"
    echo "3) Check current secrets status"
    read -p "Enter your choice (1, 2, or 3): " choice
    
    case $choice in
        1)
            log_info "Creating temporary GOOGLE_VISION_API_KEY secret..."
            read -p "Enter your Google Cloud Vision API key: " vision_api_key
            create_secret_if_missing "GOOGLE_VISION_API_KEY" "$vision_api_key"
            log_success "Quick fix applied. You can now deploy."
            ;;
        2)
            log_info "Performing proper cleanup and setup..."
            
            # Remove old environment variable from Cloud Run service
            remove_env_var "GOOGLE_VISION_API_KEY"
            
            # Create new secrets
            echo -e "${BLUE}Setting up new secrets...${NC}"
            
            # OpenAI API Key
            read -p "Enter your OpenAI API key: " openai_key
            create_secret_if_missing "OPENAI_API_KEY" "$openai_key"
            
            # Google Application Credentials
            echo -e "${BLUE}For Google Application Credentials, you have two options:${NC}"
            echo "1) Use a service account file path (for local development)"
            echo "2) Use base64 encoded service account (for production)"
            read -p "Choose option (1 or 2): " cred_option
            
            if [ "$cred_option" = "1" ]; then
                read -p "Enter the path to your service account JSON file: " sa_file_path
                if [ -f "$sa_file_path" ]; then
                    sa_content=$(cat "$sa_file_path")
                    create_secret_if_missing "GOOGLE_APPLICATION_CREDENTIALS" "$sa_content"
                else
                    log_error "File not found: $sa_file_path"
                    exit 1
                fi
            elif [ "$cred_option" = "2" ]; then
                read -p "Enter your base64 encoded service account JSON: " sa_base64
                create_secret_if_missing "VISION_SERVICE_ACCOUNT_BASE64" "$sa_base64"
            else
                log_error "Invalid option"
                exit 1
            fi
            
            log_success "Proper cleanup and setup completed!"
            ;;
        3)
            log_info "Checking current secrets status..."
            
            echo -e "${BLUE}Existing secrets in project $PROJECT_ID:${NC}"
            gcloud secrets list --project="$PROJECT_ID" --format="table(name,createTime)"
            
            echo -e "\n${BLUE}Current Cloud Run service environment variables:${NC}"
            gcloud run services describe "$SERVICE_NAME" \
                --region="$REGION" \
                --format="value(spec.template.spec.containers[0].env[].name)" \
                --project="$PROJECT_ID" 2>/dev/null || echo "No environment variables found"
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run the main function
main "$@" 