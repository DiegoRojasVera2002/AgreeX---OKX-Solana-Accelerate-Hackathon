# AgreeX Smart Contracts - OKX DEX Integration

## Overview

AgreeX Smart Contracts provide a decentralized escrow solution for freelance agreements, fully integrated with OKX DEX Aggregator v5. The contracts support multi-chain deployment and enable automatic payment releases with optional token swaps through OKX DEX.

## Features

- **Multi-Chain Support**: Deploy on Ethereum, Polygon, Arbitrum, Optimism, Avalanche, and BSC
- **OKX DEX Integration**: Swap payments to freelancer's preferred token
- **Milestone-Based Payments**: Release funds as work progresses
- **Supervisor Verification**: Third-party validation of completed work
- **Gas Optimization**: Efficient contract design for lower transaction costs
- **Cross-Chain Compatibility**: Works seamlessly across OKX DEX supported networks

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    Employer     │────▶│  AgreeX Escrow   │────▶│   OKX DEX API   │
│                 │     │    Contract      │     │   Aggregator    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌──────────────────┐              │
         └─────────────▶│   Freelancer     │◀─────────────┘
                        └──────────────────┘
```

## Contract Functions

### Core Functions

1. **createContract**: Create a new freelance agreement with escrow
2. **completeMilestone**: Mark a milestone as completed (supervisor only)
3. **swapAndPay**: Execute payment with token swap via OKX DEX
4. **cancelContract**: Cancel agreement and refund employer

### View Functions

- `getContract`: Retrieve contract details
- `getMilestones`: Get all milestones for a contract
- `getContractsByEmployer`: List contracts by employer
- `getContractsByFreelancer`: List contracts by freelancer

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with the following variables:

```env
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC endpoints
ALCHEMY_API_KEY=your_alchemy_api_key

# Block explorer API keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key

# OKX DEX Configuration
OKX_API_KEY=your_okx_api_key
OKX_SECRET_KEY=your_okx_secret_key
OKX_PASSPHRASE=your_okx_passphrase
```

## Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Networks

```bash
# Deploy to Ethereum mainnet
npm run deploy:ethereum

# Deploy to Polygon
npm run deploy:polygon

# Deploy to Arbitrum
npm run deploy:arbitrum
```

### Verify Contracts

Contracts are automatically verified after deployment. Manual verification:

```bash
npx hardhat verify --network ethereum DEPLOYED_CONTRACT_ADDRESS
```

## Usage Example

### Creating a Contract

```javascript
const contractId = "FREELANCE-001";
const freelancer = "0x123...";
const supervisor = "0x456...";
const paymentToken = "0x0000000000000000000000000000000000000000"; // ETH
const milestones = ["Design", "Development", "Testing"];
const amounts = [
  ethers.utils.parseEther("0.5"),
  ethers.utils.parseEther("1.0"),
  ethers.utils.parseEther("0.5")
];

await agreeXEscrow.createContract(
  contractId,
  freelancer,
  supervisor,
  paymentToken,
  milestones,
  amounts,
  { value: ethers.utils.parseEther("2.0") }
);
```

### Completing a Milestone with OKX DEX Swap

```javascript
// Supervisor marks milestone as completed
await agreeXEscrow.completeMilestone(contractId, 0);

// Or swap payment to USDC via OKX DEX
const toToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const minReturn = ethers.utils.parseUnits("950", 6); // Min 950 USDC
const pools = ["0x..."]; // OKX DEX pools
const swapData = "0x..."; // Swap calldata from OKX API

await agreeXEscrow.swapAndPay(
  contractId,
  0,
  toToken,
  minReturn,
  pools,
  swapData
);
```

## Testing

```bash
npm test
```

## Gas Optimization

The contracts are optimized for gas efficiency:
- Efficient storage patterns
- Minimal external calls
- Optimized loops and conditions

## Security Considerations

- Only supervisors can mark milestones as completed
- Funds are locked in escrow until conditions are met
- Automatic refunds on cancellation
- Reentrancy protection on all payment functions

## OKX DEX Integration Details

### Supported Chains

- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Avalanche (Chain ID: 43114)
- BSC (Chain ID: 56)

### Aggregator Addresses

All chains use the OKX DEX Aggregator at: `0x1111111254EEB25477B68fb85Ed929f73A960582`

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/agreex/contracts/issues)
- Email: support@agreex.io
- OKX DEX Docs: https://www.okx.com/docs-v5/en/
