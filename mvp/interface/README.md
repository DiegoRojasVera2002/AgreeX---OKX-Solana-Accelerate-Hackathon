# AgreeX API - OKX DEX Integration

## Overview

AgreeX API is a RESTful service that provides backend functionality for the AgreeX freelance contract platform. It integrates with OKX DEX Aggregator v5 to enable multi-chain smart contract management and token swaps.

## Features

- **Multi-Chain Support**: Deploy and manage contracts on Ethereum, Polygon, Arbitrum, Optimism, Avalanche, and BSC
- **OKX DEX Integration**: Get swap quotes and execute token swaps via OKX DEX
- **Smart Contract Management**: Create, update, and cancel freelance contracts
- **Milestone Tracking**: Complete milestones and release payments automatically
- **Cross-Chain Swaps**: Pay freelancers in their preferred token using OKX DEX

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend App  │────▶│   AgreeX API     │────▶│   OKX DEX API   │
│                 │     │   (Express.js)   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Smart Contracts  │
                        │  (Multi-chain)   │
                        └──────────────────┘
```

## Installation

```bash
# Clone the repository
git clone https://github.com/agreex/api.git
cd api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with your credentials
```

## Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OKX DEX API Credentials
OKX_API_KEY=your_okx_api_key
OKX_SECRET_KEY=your_okx_secret_key
OKX_PASSPHRASE=your_okx_passphrase
OKX_PROJECT_ID=agreex-api

# Blockchain Configuration
SUPERVISOR_PRIVATE_KEY=your_supervisor_private_key
ALCHEMY_API_KEY=your_alchemy_api_key

# Contract Addresses (deployed on each chain)
ETH_CONTRACT_ADDRESS=0x...
POLYGON_CONTRACT_ADDRESS=0x...
ARBITRUM_CONTRACT_ADDRESS=0x...
OPTIMISM_CONTRACT_ADDRESS=0x...
AVALANCHE_CONTRACT_ADDRESS=0x...
BSC_CONTRACT_ADDRESS=0x...

# RPC URLs (optional - defaults provided)
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/
POLYGON_RPC_URL=https://polygon-rpc.com
# ... etc

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,https://app.agreex.io
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### General

- `GET /api/info` - Get API information
- `GET /api/v1/health` - Health check endpoint

### Chains

- `GET /api/v1/chains` - List supported chains
- `GET /api/v1/chains/:chainId` - Get chain details
- `GET /api/v1/chains/:chainId/tokens` - Get supported tokens for a chain

### Contracts

- `POST /api/v1/contracts` - Create a new contract
- `GET /api/v1/contracts/:chainId/:contractId` - Get contract details
- `POST /api/v1/contracts/:chainId/:contractId/cancel` - Cancel a contract

### Milestones

- `POST /api/v1/contracts/:chainId/:contractId/milestones/:milestoneIndex/complete` - Complete a milestone
- `POST /api/v1/contracts/:chainId/:contractId/milestones/:milestoneIndex/swap-pay` - Complete with token swap

### Swaps

- `POST /api/v1/swap/quote` - Get swap quote from OKX DEX
- `POST /api/v1/swap/execute` - Execute a token swap

## Example Requests

### Create Contract

```bash
curl -X POST http://localhost:3000/api/v1/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "137",
    "contractId": "FREELANCE-001",
    "freelancer": "0x123...",
    "supervisor": "0x456...",
    "paymentToken": "0x0000000000000000000000000000000000000000",
    "milestones": [
      {"description": "Design Phase", "amount": "0.5"},
      {"description": "Development", "amount": "1.0"},
      {"description": "Testing", "amount": "0.5"}
    ],
    "totalAmount": "2.0"
  }'
```

### Get Swap Quote

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

### Complete Milestone

```bash
curl -X POST http://localhost:3000/api/v1/contracts/137/FREELANCE-001/milestones/0/complete \
  -H "Content-Type: application/json"
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `400` - Bad Request (invalid parameters)
- `404` - Resource not found
- `500` - Internal server error

## Security

- All endpoints require proper authentication headers for OKX DEX
- Private keys are never exposed in responses
- CORS is configured to allow only whitelisted origins
- Helmet.js is used for security headers
- Input validation on all endpoints

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

## Deployment

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

Ensure all sensitive environment variables are properly set in your production environment. Never commit `.env` files to version control.

## Monitoring

The API includes:
- Request logging with Morgan
- Error logging with Winston
- Health check endpoint for monitoring
- Performance metrics in responses

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/agreex/api/issues)
- Email: api-support@agreex.io
- OKX DEX Docs: https://www.okx.com/docs-v5/en/ 