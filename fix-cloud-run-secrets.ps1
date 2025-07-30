# Fix Cloud Run Secrets Script for PowerShell
# This script helps clean up old secrets and set up new ones for the FridgeToFeast app

param(
    [string]$ProjectId = "fridgefeast-466610",
    [string]$ServiceName = "fridge-feast-next-app",
    [string]$Region = "us-central1"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if a secret exists
function Test-SecretExists {
    param([string]$SecretName)
    
    try {
        gcloud secrets describe $SecretName --project=$ProjectId 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Function to create a secret if it doesn't exist
function New-SecretIfMissing {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    if (-not (Test-SecretExists $SecretName)) {
        Write-Info "Creating secret: $SecretName"
        $SecretValue | gcloud secrets create $SecretName --project=$ProjectId --data-file=-
        Write-Success "Secret $SecretName created successfully"
    }
    else {
        Write-Info "Secret $SecretName already exists"
    }
}

# Function to update a secret
function Update-Secret {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    if (Test-SecretExists $SecretName) {
        Write-Info "Updating secret: $SecretName"
        $SecretValue | gcloud secrets versions add $SecretName --project=$ProjectId --data-file=-
        Write-Success "Secret $SecretName updated successfully"
    }
    else {
        Write-Error "Secret $SecretName does not exist. Please create it first."
        return $false
    }
}

# Function to remove environment variable from Cloud Run service
function Remove-EnvVar {
    param([string]$EnvVarName)
    
    Write-Info "Removing environment variable: $EnvVarName from Cloud Run service"
    
    try {
        # Get current environment variables
        $currentEnv = gcloud run services describe $ServiceName --region=$Region --format="value(spec.template.spec.containers[0].env[].name)" --project=$ProjectId 2>$null
        
        if ($currentEnv -and $currentEnv.Contains($EnvVarName)) {
            # Remove the specific environment variable
            gcloud run services update $ServiceName --region=$Region --remove-env-vars=$EnvVarName --project=$ProjectId --quiet
            Write-Success "Removed environment variable: $EnvVarName"
        }
        else {
            Write-Info "Environment variable $EnvVarName not found in service"
        }
    }
    catch {
        Write-Info "Could not check or remove environment variable: $EnvVarName"
    }
}

# Main function
function Main {
    Write-Info "Starting Cloud Run secrets cleanup and setup..."
    
    # Check if gcloud is authenticated
    try {
        $activeAccount = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>$null
        if (-not $activeAccount) {
            Write-Error "Please authenticate with gcloud first: gcloud auth login"
            exit 1
        }
    }
    catch {
        Write-Error "Please authenticate with gcloud first: gcloud auth login"
        exit 1
    }
    
    # Check if project is set
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $ProjectId) {
        Write-Warning "Setting project to $ProjectId"
        gcloud config set project $ProjectId
    }
    
    Write-Host "Choose an option:" -ForegroundColor $Blue
    Write-Host "1) Quick fix: Create missing GOOGLE_VISION_API_KEY secret (temporary)"
    Write-Host "2) Proper fix: Clean up old secrets and set up new ones"
    Write-Host "3) Check current secrets status"
    
    $choice = Read-Host "Enter your choice (1, 2, or 3)"
    
    switch ($choice) {
        "1" {
            Write-Info "Creating temporary GOOGLE_VISION_API_KEY secret..."
            $visionApiKey = Read-Host "Enter your Google Cloud Vision API key"
            New-SecretIfMissing "GOOGLE_VISION_API_KEY" $visionApiKey
            Write-Success "Quick fix applied. You can now deploy."
        }
        "2" {
            Write-Info "Performing proper cleanup and setup..."
            
            # Remove old environment variable from Cloud Run service
            Remove-EnvVar "GOOGLE_VISION_API_KEY"
            
            # Create new secrets
            Write-Host "Setting up new secrets..." -ForegroundColor $Blue
            
            # OpenAI API Key
            $openaiKey = Read-Host "Enter your OpenAI API key"
            New-SecretIfMissing "OPENAI_API_KEY" $openaiKey
            
            # Google Application Credentials
            Write-Host "For Google Application Credentials, you have two options:" -ForegroundColor $Blue
            Write-Host "1) Use a service account file path (for local development)"
            Write-Host "2) Use base64 encoded service account (for production)"
            $credOption = Read-Host "Choose option (1 or 2)"
            
            if ($credOption -eq "1") {
                $saFilePath = Read-Host "Enter the path to your service account JSON file"
                if (Test-Path $saFilePath) {
                    $saContent = Get-Content $saFilePath -Raw
                    New-SecretIfMissing "GOOGLE_APPLICATION_CREDENTIALS" $saContent
                }
                else {
                    Write-Error "File not found: $saFilePath"
                    exit 1
                }
            }
            elseif ($credOption -eq "2") {
                $saBase64 = Read-Host "Enter your base64 encoded service account JSON"
                New-SecretIfMissing "VISION_SERVICE_ACCOUNT_BASE64" $saBase64
            }
            else {
                Write-Error "Invalid option"
                exit 1
            }
            
            Write-Success "Proper cleanup and setup completed!"
        }
        "3" {
            Write-Info "Checking current secrets status..."
            
            Write-Host "Existing secrets in project ${ProjectId}:" -ForegroundColor $Blue
            gcloud secrets list --project=$ProjectId --format="table(name,createTime)"
            
            Write-Host "`nCurrent Cloud Run service environment variables:" -ForegroundColor $Blue
            try {
                $envVars = gcloud run services describe $ServiceName --region=$Region --format="value(spec.template.spec.containers[0].env[].name)" --project=$ProjectId 2>$null
                if ($envVars) {
                    Write-Host $envVars
                }
                else {
                    Write-Host "No environment variables found"
                }
            }
            catch {
                Write-Host "Could not retrieve environment variables"
            }
        }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }
}

# Run the main function
Main 