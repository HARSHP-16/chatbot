# UniMind Chatbot - Azure Deployment Setup Guide

## ✅ Prerequisites

1. **Azure Account** - [Create free account](https://azure.microsoft.com/free)
2. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Docker** (optional, for container deployment)
4. **Git** - For CI/CD integration

## 📦 Updated Dependencies

All required packages are in `backend/requirements.txt`:
- **Flask 2.3.3** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin requests
- **Gunicorn 21.2.0** - Production WSGI server
- **Azure SDK** packages for storage and identity
- **Groq 0.4.2** - AI API integration
- **Python-dotenv 1.0.0** - Environment configuration

## 🚀 Quick Deployment (Azure App Service)

### Step 1: Login to Azure
```bash
az login
```

### Step 2: Create Resource Group
```bash
az group create --name unimind-rg --location eastus
```

### Step 3: Create App Service Plan
```bash
az appservice plan create \
  --name unimind-app-plan \
  --resource-group unimind-rg \
  --is-linux \
  --sku B2
```

### Step 4: Create Web App
```bash
az webapp create \
  --resource-group unimind-rg \
  --plan unimind-app-plan \
  --name unimind-chatbot \
  --runtime "PYTHON|3.11"
```

### Step 5: Configure Startup
```bash
az webapp config set \
  --resource-group unimind-rg \
  --name unimind-chatbot \
  --startup-file "bash startup.sh"
```

### Step 6: Set Environment Variables
```bash
az webapp config appsettings set \
  --resource-group unimind-rg \
  --name unimind-chatbot \
  --settings \
    GROQ_API_KEY="your_groq_api_key" \
    FLASK_ENV="production" \
    DEBUG="False"
```

### Step 7: Deploy Code
```bash
# Option A: ZIP deployment
zip -r app.zip . -x ".git/*" ".venv/*" "__pycache__/*"
az webapp deployment source config-zip \
  --resource-group unimind-rg \
  --name unimind-chatbot \
  --src ./app.zip

# Option B: Git deployment
az webapp deployment source config-local-git \
  --resource-group unimind-rg \
  --name unimind-chatbot
git remote add azure <deployment_url>
git push azure main
```

## 🐳 Docker Container Deployment

### Build & Test Locally
```bash
docker build -t unimind-chatbot .
docker-compose up
# Visit http://localhost:8000
```

### Deploy to Azure Container Registry
```bash
# Create registry
az acr create \
  --resource-group unimind-rg \
  --name unimindregistry \
  --sku Basic

# Build and push
az acr build \
  --registry unimindregistry \
  --image unimind-chatbot:latest .

# Deploy to App Service
az webapp create \
  --resource-group unimind-rg \
  --plan unimind-app-plan \
  --name unimind-chatbot \
  --deployment-container-image-name unimindregistry.azurecr.io/unimind-chatbot:latest
```

## 📊 Features Included

✅ **Production-Ready**
- Gunicorn WSGI server with 4 workers
- Proper CORS configuration
- Error handlers (404, 500)
- Environment-based settings

✅ **Cloud Integration**
- Azure App Service support
- Docker containerization
- GitHub Actions CI/CD
- Environment variable management

✅ **Monitoring**
- Health check endpoint (`/api/health`)
- Application Insights ready
- Startup logging

## 📝 Files Added/Updated

### Configuration Files
- `requirements.txt` - Updated with production packages
- `runtime.txt` - Python 3.11 specification
- `startup.sh` - Azure App Service startup script
- `.deployment` - Azure deployment configuration
- `app.yaml` - Google Cloud deployment config
- `Dockerfile` - Container image definition
- `docker-compose.yml` - Local development with Docker

### Azure Files
- `.azure/config.json` - Azure resource configuration
- `AZURE_DEPLOYMENT.md` - Detailed deployment guide
- `.github/workflows/azure-deployment.yml` - Auto-deployment on push

### Updated Code
- `backend/app.py` - Production settings, error handlers
- `backend/.env.example` - Environment variable template

## 🔐 Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure CORS properly (replace "*" with your domain)
- [ ] Secure all API keys in Azure Key Vault
- [ ] Enable HTTPS only
- [ ] Use managed identity for Azure services
- [ ] Enable Application Insights monitoring
- [ ] Set up proper backup for data

## 📍 After Deployment

Your app will be available at:
```
https://unimind-chatbot.azurewebsites.net
```

## 🔍 Monitoring & Debugging

```bash
# View logs
az webapp log tail \
  --resource-group unimind-rg \
  --name unimind-chatbot

# Check health
curl https://unimind-chatbot.azurewebsites.net/api/health

# Scale resources
az appservice plan update \
  --name unimind-app-plan \
  --resource-group unimind-rg \
  --sku S1
```

## 💡 Tips

- Use **B1 or B2** plan for development/testing
- Use **S1 or P1** plan for production traffic
- Enable **Auto-scale** for variable workloads
- Monitor costs in Azure Portal
- Use **Slots** for blue-green deployments

## ❓ Troubleshooting

- **SSL Certificate Issues**: Azure App Service provides free certificates
- **Startup Failures**: Check logs with `az webapp log tail`
- **CORS Errors**: Update origin in app.py CORS config
- **API Key Errors**: Verify env vars in Azure Portal

For more details, see `AZURE_DEPLOYMENT.md`
