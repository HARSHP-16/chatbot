# Azure App Service README

## Deployment Steps

### Option 1: Azure App Service (Recommended)

1. **Create Resource Group:**
   ```bash
   az group create --name unimind-rg --location eastus
   ```

2. **Create App Service Plan:**
   ```bash
   az appservice plan create --name unimind-app-plan --resource-group unimind-rg --is-linux --sku B2
   ```

3. **Create Web App:**
   ```bash
   az webapp create --resource-group unimind-rg --plan unimind-app-plan --name unimind-chatbot --runtime "PYTHON|3.11"
   ```

4. **Configure Startup Command:**
   ```bash
   az webapp config set --resource-group unimind-rg --name unimind-chatbot --startup-file "bash startup.sh"
   ```

5. **Set Environment Variables:**
   ```bash
   az webapp config appsettings set --resource-group unimind-rg --name unimind-chatbot --settings GROQ_API_KEY="your_key" FLASK_ENV="production"
   ```

6. **Deploy via Git (or Azure CLI):**
   ```bash
   az webapp deployment source config-zip --resource-group unimind-rg --name unimind-chatbot --src ./app.zip
   ```

### Option 2: Docker Container (Azure Container Instances)

1. **Build Docker Image:**
   ```bash
   docker build -t unimind-chatbot .
   ```

2. **Tag and Push to Azure Container Registry:**
   ```bash
   az login
   az acr create --resource-group unimind-rg --name unimindregistry --sku Basic
   docker tag unimind-chatbot unimindregistry.azurecr.io/unimind-chatbot:latest
   docker push unimindregistry.azurecr.io/unimind-chatbot:latest
   ```

3. **Deploy to Container Instances:**
   ```bash
   az container create --resource-group unimind-rg --name unimind-api --image unimindregistry.azurecr.io/unimind-chatbot:latest --ports 8000 --environment-variables GROQ_API_KEY="your_key"
   ```

### Option 3: Azure App Service with Docker

1. **Deploy from ACR:**
   ```bash
   az webapp create --resource-group unimind-rg --plan unimind-app-plan --name unimind-chatbot --deployment-container-image-name unimindregistry.azurecr.io/unimind-chatbot:latest
   ```

## Environment Variables

Required variables in Azure App Service Settings:
- `GROQ_API_KEY` - Your Groq API key
- `FLASK_ENV` - Set to `production`
- `DEBUG` - Set to `False`

## Database (Optional - Azure Cosmos DB)

If using Azure Cosmos DB for persistence:

```bash
az cosmosdb create --name unimind-cosmosdb --resource-group unimind-rg --kind MongoDB
```

## Monitoring

Enable Application Insights:
```bash
az webapp config appsettings set --resource-group unimind-rg --name unimind-chatbot --settings APPINSIGHTS_INSTRUMENTATIONKEY="your_key"
```

## After Deployment

- Access your app at: `https://unimind-chatbot.azurewebsites.net`
- View logs: `az webapp log tail --resource-group unimind-rg --name unimind-chatbot`
- Scale up if needed: `az appservice plan update --name unimind-app-plan --resource-group unimind-rg --sku S1`
