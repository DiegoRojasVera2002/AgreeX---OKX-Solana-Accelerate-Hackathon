# Comandos de Deployment - AgreeX OKX DEX Integration

## Configuración Inicial

### 1. Instalar Dependencias

```bash
# Backend API
cd mvp/interface
npm install

# Smart Contracts
cd ../ezcontract
npm install

# Agentes AI
cd ../agentic_use
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp mvp/interface/.env.example mvp/interface/.env
cp mvp/ezcontract/.env.example mvp/ezcontract/.env
cp mvp/agentic_use/.env.example mvp/agentic_use/.env
```

## Deployment de Smart Contracts

### Compilar Contratos

```bash
cd mvp/ezcontract
npx hardhat compile
```

### Deploy en Diferentes Chains

```bash
# Ethereum Mainnet
npx hardhat run scripts/deploy.js --network ethereum

# Polygon
npx hardhat run scripts/deploy.js --network polygon

# Arbitrum
npx hardhat run scripts/deploy.js --network arbitrum

# Optimism
npx hardhat run scripts/deploy.js --network optimism

# Avalanche
npx hardhat run scripts/deploy.js --network avalanche

# BSC
npx hardhat run scripts/deploy.js --network bsc
```

### Verificar Contratos

```bash
# Verificar en Etherscan (ejemplo)
npx hardhat verify --network ethereum DEPLOYED_CONTRACT_ADDRESS

# Verificar en Polygonscan
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS
```

## API Backend

### Desarrollo Local

```bash
cd mvp/interface
npm run dev
```

### Producción

```bash
npm start
```

## Pruebas de Integración OKX DEX

### 1. Obtener Quote de Swap

```bash
curl -X POST http://localhost:3000/api/v1/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "1",
    "fromToken": "0x0000000000000000000000000000000000000000",
    "toToken": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "amount": "1.0"
  }'
```

### 2. Crear Contrato

```bash
curl -X POST http://localhost:3000/api/v1/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "137",
    "contractId": "AGX-001",
    "freelancer": "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    "supervisor": "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed",
    "paymentToken": "0x0000000000000000000000000000000000000000",
    "milestones": [
      {"description": "Diseño UI/UX", "amount": "0.5"},
      {"description": "Desarrollo Frontend", "amount": "1.0"},
      {"description": "Testing y QA", "amount": "0.5"}
    ],
    "totalAmount": "2.0"
  }'
```

### 3. Completar Milestone con Swap

```bash
curl -X POST http://localhost:3000/api/v1/contracts/137/AGX-001/milestones/0/swap-pay \
  -H "Content-Type: application/json" \
  -d '{
    "toToken": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "minReturn": "1000",
    "pools": [],
    "swapData": "0x"
  }'
```

## Monitoreo y Logs

### Ver Logs del API

```bash
# Desarrollo
npm run dev

# Producción con PM2
pm2 start src/index.js --name agreex-api
pm2 logs agreex-api
```

### Monitorear Transacciones

```bash
# Ethereum
https://etherscan.io/tx/{TRANSACTION_HASH}

# Polygon
https://polygonscan.com/tx/{TRANSACTION_HASH}

# Arbitrum
https://arbiscan.io/tx/{TRANSACTION_HASH}
```

## Docker Deployment

### Build y Run

```bash
# Build imagen
docker build -t agreex-api .

# Run container
docker run -d \
  --name agreex-api \
  -p 3000:3000 \
  --env-file .env \
  agreex-api
```

### Docker Compose

```bash
docker-compose up -d
```

## Configuración OKX API

### Headers Requeridos

```javascript
{
  'OK-ACCESS-KEY': 'tu-api-key',
  'OK-ACCESS-SIGN': 'signature',
  'OK-ACCESS-TIMESTAMP': 'timestamp',
  'OK-ACCESS-PASSPHRASE': 'tu-passphrase',
  'OK-ACCESS-PROJECT-ID': 'agreex-api'
}
```

### Endpoints OKX DEX v5

- Quote: `GET /api/v5/dex/aggregator/quote`
- Swap: `GET /api/v5/dex/aggregator/swap`
- Tokens: `GET /api/v5/dex/aggregator/tokens`

## Troubleshooting

### Error: OKX API Key Invalid

```bash
# Verificar variables de entorno
echo $OKX_API_KEY
echo $OKX_SECRET_KEY
echo $OKX_PASSPHRASE
```

### Error: Contract Not Deployed

```bash
# Verificar dirección del contrato en la chain correcta
npx hardhat run scripts/verify-deployment.js --network polygon
```

### Error: Insufficient Gas

```bash
# Aumentar gas limit en hardhat.config.js
networks: {
  polygon: {
    gas: 5000000,
    gasPrice: 50000000000
  }
}
``` 