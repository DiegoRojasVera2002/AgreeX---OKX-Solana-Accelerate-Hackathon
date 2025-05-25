# AgreeX AI Agents for OKX DEX Integration

## Overview

This module contains the AI-powered verification agents for the AgreeX platform, fully integrated with OKX DEX API v5. These agents handle smart contract milestone verification, cross-chain condition checking, and automated payment releases through the OKX DEX ecosystem.

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AgreeX Frontend   │────▶│  Verification    │────▶│   OKX DEX API   │
│                     │     │     Agent        │     │   Aggregator    │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Smart Contract  │
                            │   on Multiple    │
                            │     Chains       │
                            └──────────────────┘
```

## Features

- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Avalanche, BSC
- **OKX DEX Integration**: Direct integration with OKX DEX Aggregator v5
- **Cross-Chain Verification**: Verify conditions across different blockchains
- **Automated Payments**: Release payments automatically when milestones are completed
- **Gas Optimization**: Uses OKX DEX routing for optimal gas costs

## Components

### 1. `agent.py`
Main verification agent that processes contract milestones and integrates with OKX DEX.

### 2. `okx_dex_config.py`
Configuration management for OKX DEX API authentication and endpoints.

### 3. `okx_dex_utils.py`
Utility functions for:
- Getting swap quotes from OKX DEX
- Verifying contract deployments
- Checking milestone completion
- Initiating payment releases
- Cross-chain condition verification

## Usage

### Environment Variables

```bash
export OKX_API_KEY="your-api-key"
export OKX_SECRET_KEY="your-secret-key"
export OKX_PASSPHRASE="your-passphrase"
export OKX_PROJECT_ID="agreex-contracts"
export OKX_SIMULATE_MODE="false"  # Set to "true" for testing
```

### Example: Verify Contract Milestone

```python
from agent import process_agreex_verification

contract_data = {
    "chainId": "1",  # Ethereum
    "contractAddress": "0x...",
    "conditions": [
        {"description": "Complete frontend design"},
        {"description": "Implement smart contract"},
        {"description": "Deploy to mainnet"}
    ]
}

verification_text = "I have completed the frontend design and deployed the smart contract to mainnet"

result = process_agreex_verification(None, contract_data, verification_text)
```

### Example: Create Escrow Contract

```python
from okx_dex_utils import AgreeXContractManager

manager = AgreeXContractManager()

contract = manager.create_escrow_contract(
    employer="0x123...",
    freelancer="0x456...",
    amount="1000000000000000000",  # 1 ETH in wei
    token="0x0000000000000000000000000000000000000000",  # Native ETH
    chain="ethereum",
    milestones=[
        {"description": "Design phase", "amount": "300000000000000000"},
        {"description": "Development", "amount": "500000000000000000"},
        {"description": "Deployment", "amount": "200000000000000000"}
    ]
)
```

## OKX DEX API Integration

### Supported Endpoints

1. **Quote API**: `/api/v5/dex/aggregator/quote`
   - Get best prices across multiple DEXs
   - Optimize for lowest slippage

2. **Swap API**: `/api/v5/dex/aggregator/swap`
   - Execute token swaps
   - Support for 100+ DEXs

3. **Cross-Chain API**: `/api/v5/dex/aggregator/cross-chain`
   - Verify conditions across chains
   - Bridge assets seamlessly

### Authentication

All requests to OKX DEX API require:
- `OK-ACCESS-KEY`: API Key
- `OK-ACCESS-SIGN`: HMAC SHA256 signature
- `OK-ACCESS-TIMESTAMP`: Request timestamp
- `OK-ACCESS-PASSPHRASE`: API passphrase
- `OK-ACCESS-PROJECT-ID`: Project identifier

## Testing

Run in simulation mode for testing without real API calls:

```bash
export OKX_SIMULATE_MODE="true"
python agent.py
```

## Security Considerations

- Never expose API keys in code
- Use environment variables for sensitive data
- Implement rate limiting for API calls
- Validate all input data before processing
- Use secure communication channels (HTTPS)

## Support

For OKX DEX API documentation: https://www.okx.com/docs-v5/en/
For AgreeX support: support@agreex.io 