# 🚀 Google Cloud Vision API Setup Guide

This guide will help you set up Google Cloud Vision API credentials for the FridgeToFeast application.

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Google Cloud Vision API** enabled
3. **Service Account** with Vision API permissions

## 🔧 Step-by-Step Setup

### 1. Enable Google Cloud Vision API

```bash
# Enable the Vision API
gcloud services enable vision.googleapis.com
```

### 2. Create a Service Account

```bash
# Create a service account
gcloud iam service-accounts create fridge-feast-vision \
    --display-name="Fridge to Feast Vision API"

# Get the service account email
SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:Fridge to Feast Vision API" \
    --format="value(email)")
```

### 3. Grant Vision API Permissions

```bash
# Grant Vision API permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/ml.developer"

# Grant additional permissions for Vision API
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/aiplatform.user"
```

### 4. Create and Download Service Account Key

```bash
# Create a service account key
gcloud iam service-accounts keys create vision-service-account.json \
    --iam-account=$SA_EMAIL
```

## 🔐 Environment Variables Setup

### Option 1: Local Development

For local development, use the service account file:

```bash
# Set the environment variable to point to your service account file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/vision-service-account.json"
```

### Option 2: Production (Google Cloud)

For production deployment, encode the service account as base64:

```bash
# Encode the service account file as base64
VISION_SERVICE_ACCOUNT_BASE64=$(base64 -i vision-service-account.json)

# Use this value in your Google Cloud secrets
echo $VISION_SERVICE_ACCOUNT_BASE64
```

## 🏗️ Google Cloud Secrets Setup

### 1. Create Secrets in Google Cloud

```bash
# Create the OpenAI API key secret
echo -n "your-openai-api-key" | gcloud secrets create OPENAI_API_KEY --data-file=-

# Create the Vision service account secret
echo -n "$VISION_SERVICE_ACCOUNT_BASE64" | gcloud secrets create VISION_SERVICE_ACCOUNT_BASE64 --data-file=-
```

### 2. Grant Access to Cloud Run Service

```bash
# Get your Cloud Run service account
SERVICE_ACCOUNT=$(gcloud run services describe fridge-feast-next-app \
    --region=us-central1 \
    --format="value(spec.template.spec.serviceAccountName)")

# Grant access to secrets
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding VISION_SERVICE_ACCOUNT_BASE64 \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
```

## 🧪 Testing the Setup

### 1. Test Vision API Access

```bash
# Test with a sample image
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://vision.googleapis.com/v1/images:annotate \
  -d '{
    "requests": [
      {
        "image": {
          "source": {
            "imageUri": "https://example.com/sample.jpg"
          }
        },
        "features": [
          {
            "type": "LABEL_DETECTION"
          }
        ]
      }
    ]
  }'
```

### 2. Test Your Application

1. Start your application locally with the credentials
2. Upload an image to test ingredient detection
3. Verify that ingredients are detected correctly

## 🔒 Security Best Practices

1. **Never commit service account keys** to version control
2. **Use Google Cloud Secrets** for production deployments
3. **Rotate service account keys** regularly
4. **Grant minimal permissions** to service accounts
5. **Monitor API usage** and costs

## 🚨 Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check if the service account has the correct roles
   - Verify the Vision API is enabled

2. **"Invalid credentials" errors**
   - Ensure the service account key is valid
   - Check the environment variable path

3. **"API not enabled" errors**
   - Enable the Vision API in your Google Cloud project
   - Wait a few minutes for the API to be fully activated

### Debug Commands:

```bash
# Check if Vision API is enabled
gcloud services list --enabled --filter="name:vision.googleapis.com"

# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:$SA_EMAIL"

# Test service account authentication
gcloud auth activate-service-account --key-file=vision-service-account.json
```

## 📞 Support

If you encounter issues:

1. Check the [Google Cloud Vision API documentation](https://cloud.google.com/vision/docs)
2. Review the [IAM permissions guide](https://cloud.google.com/iam/docs/understanding-roles)
3. Check the application logs for detailed error messages