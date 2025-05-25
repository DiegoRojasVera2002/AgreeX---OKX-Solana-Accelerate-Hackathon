const { ethers } = require('ethers');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// OKX DEX API Configuration
const OKX_BASE_URL = 'https://www.okx.com';
const OKX_DEX_API_VERSION = '/api/v5/dex';

// Supported chains configuration
const CHAIN_CONFIG = {
  ethereum: {
    chainId: '1',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/',
    nativeCurrency: 'ETH',
    explorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: '137',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    nativeCurrency: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    chainId: '42161',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  optimism: {
    chainId: '10',
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    nativeCurrency: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  },
  avalanche: {
    chainId: '43114',
    rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrency: 'AVAX',
    explorer: 'https://snowtrace.io'
  },
  bsc: {
    chainId: '56',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    nativeCurrency: 'BNB',
    explorer: 'https://bscscan.com'
  }
};

// Contract addresses
const CONTRACT_ADDRESSES = {
  '1': process.env.ETH_CONTRACT_ADDRESS,
  '137': process.env.POLYGON_CONTRACT_ADDRESS,
  '42161': process.env.ARBITRUM_CONTRACT_ADDRESS,
  '10': process.env.OPTIMISM_CONTRACT_ADDRESS,
  '43114': process.env.AVALANCHE_CONTRACT_ADDRESS,
  '56': process.env.BSC_CONTRACT_ADDRESS
};

class OKXDexService {
  constructor() {
    this.providers = {};
    this.contracts = {};
    this.wallets = {};
    this.initialized = false;
  }

  // Initialize service
  async initialize() {
    try {
      console.log('Initializing OKX DEX Service...');
      
      // Validate configuration
      this.validateConfig();
      
      // Initialize providers for each chain
      for (const [chainName, config] of Object.entries(CHAIN_CONFIG)) {
        const provider = new ethers.providers.JsonRpcProvider(
          config.rpcUrl + (process.env.ALCHEMY_API_KEY || ''),
          parseInt(config.chainId)
        );
        
        this.providers[config.chainId] = provider;
        
        // Test connection
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected to ${chainName} (Chain ID: ${config.chainId}) - Block: ${blockNumber}`);
      }
      
      // Initialize wallets
      if (process.env.SUPERVISOR_PRIVATE_KEY) {
        for (const [chainId, provider] of Object.entries(this.providers)) {
          this.wallets[chainId] = new ethers.Wallet(process.env.SUPERVISOR_PRIVATE_KEY, provider);
        }
      }
      
      // Initialize contract instances
      await this.initializeContracts();
      
      this.initialized = true;
      console.log('✅ OKX DEX Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OKX DEX Service:', error);
      throw error;
    }
  }

  // Validate required configuration
  validateConfig() {
    const requiredEnvVars = [
      'OKX_API_KEY',
      'OKX_SECRET_KEY',
      'OKX_PASSPHRASE',
      'OKX_PROJECT_ID'
    ];
    
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Initialize contract instances
  async initializeContracts() {
    const contractABI = require('./abis/AgreeXEscrow.json');
    
    for (const [chainId, address] of Object.entries(CONTRACT_ADDRESSES)) {
      if (address && this.providers[chainId]) {
        this.contracts[chainId] = new ethers.Contract(
          address,
          contractABI,
          this.wallets[chainId] || this.providers[chainId]
        );
        console.log(`📝 Contract initialized on chain ${chainId}: ${address}`);
      }
    }
  }

  // Generate OKX API signature
  generateSignature(timestamp, method, requestPath, body = '') {
    const message = timestamp + method + requestPath + body;
    const signature = crypto
      .createHmac('sha256', process.env.OKX_SECRET_KEY)
      .update(message)
      .digest('base64');
    return signature;
  }

  // Get OKX API headers
  getOKXHeaders(method, requestPath, body = '') {
    const timestamp = new Date().toISOString();
    
    return {
      'OK-ACCESS-KEY': process.env.OKX_API_KEY,
      'OK-ACCESS-SIGN': this.generateSignature(timestamp, method, requestPath, body),
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
      'OK-ACCESS-PROJECT-ID': process.env.OKX_PROJECT_ID,
      'Content-Type': 'application/json'
    };
  }

  // Get swap quote from OKX DEX
  async getSwapQuote(chainId, fromToken, toToken, amount) {
    try {
      const requestPath = `${OKX_DEX_API_VERSION}/aggregator/quote`;
      const params = new URLSearchParams({
        chainId,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
        slippage: '0.5'
      });
      
      const headers = this.getOKXHeaders('GET', requestPath + '?' + params.toString());
      
      const response = await axios.get(
        `${OKX_BASE_URL}${requestPath}?${params}`,
        { headers }
      );
      
      if (response.data.code !== '0') {
        throw new Error(`OKX API Error: ${response.data.msg}`);
      }
      
      return response.data.data[0];
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  // Execute swap via OKX DEX
  async executeSwap(chainId, fromToken, toToken, amount, userAddress, slippage = '0.5') {
    try {
      const requestPath = `${OKX_DEX_API_VERSION}/aggregator/swap`;
      const params = new URLSearchParams({
        chainId,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
        slippage,
        userWalletAddress: userAddress,
        referrerAddress: process.env.AGREEX_REFERRER_ADDRESS || '0x0000000000000000000000000000000000000000'
      });
      
      const headers = this.getOKXHeaders('GET', requestPath + '?' + params.toString());
      
      const response = await axios.get(
        `${OKX_BASE_URL}${requestPath}?${params}`,
        { headers }
      );
      
      if (response.data.code !== '0') {
        throw new Error(`OKX API Error: ${response.data.msg}`);
      }
      
      return response.data.data[0];
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  // Create contract on blockchain
  async createContract(chainId, contractData) {
    try {
      const contract = this.contracts[chainId];
      if (!contract) {
        throw new Error(`No contract deployed on chain ${chainId}`);
      }
      
      const {
        contractId,
        freelancer,
        supervisor,
        paymentToken,
        milestoneDescriptions,
        milestoneAmounts,
        totalAmount
      } = contractData;
      
      // Prepare transaction
      const tx = await contract.createContract(
        contractId,
        freelancer,
        supervisor,
        paymentToken,
        milestoneDescriptions,
        milestoneAmounts,
        {
          value: paymentToken === ethers.constants.AddressZero ? totalAmount : 0,
          gasLimit: 500000
        }
      );
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractId
      };
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  // Get contract details
  async getContract(chainId, contractId) {
    try {
      const contract = this.contracts[chainId];
      if (!contract) {
        throw new Error(`No contract deployed on chain ${chainId}`);
      }
      
      const contractData = await contract.getContract(contractId);
      const milestones = await contract.getMilestones(contractId);
      
      return {
        ...contractData,
        milestones,
        chainId
      };
    } catch (error) {
      console.error('Error getting contract:', error);
      throw error;
    }
  }

  // Complete milestone
  async completeMilestone(chainId, contractId, milestoneIndex) {
    try {
      const contract = this.contracts[chainId];
      if (!contract) {
        throw new Error(`No contract deployed on chain ${chainId}`);
      }
      
      const tx = await contract.completeMilestone(contractId, milestoneIndex, {
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error completing milestone:', error);
      throw error;
    }
  }

  // Execute swap and pay
  async swapAndPay(chainId, contractId, milestoneIndex, toToken, swapData) {
    try {
      const contract = this.contracts[chainId];
      if (!contract) {
        throw new Error(`No contract deployed on chain ${chainId}`);
      }
      
      const { minReturn, pools, data } = swapData;
      
      const tx = await contract.swapAndPay(
        contractId,
        milestoneIndex,
        toToken,
        minReturn,
        pools,
        data,
        {
          gasLimit: 500000
        }
      );
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error executing swap and pay:', error);
      throw error;
    }
  }

  // Cancel contract
  async cancelContract(chainId, contractId) {
    try {
      const contract = this.contracts[chainId];
      if (!contract) {
        throw new Error(`No contract deployed on chain ${chainId}`);
      }
      
      const tx = await contract.cancelContract(contractId, {
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error cancelling contract:', error);
      throw error;
    }
  }

  // Get supported tokens for a chain
  async getSupportedTokens(chainId) {
    try {
      const requestPath = `${OKX_DEX_API_VERSION}/aggregator/tokens`;
      const params = new URLSearchParams({ chainId });
      
      const headers = this.getOKXHeaders('GET', requestPath + '?' + params.toString());
      
      const response = await axios.get(
        `${OKX_BASE_URL}${requestPath}?${params}`,
        { headers }
      );
      
      if (response.data.code !== '0') {
        throw new Error(`OKX API Error: ${response.data.msg}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting supported tokens:', error);
      throw error;
    }
  }

  // Get chain info
  getChainInfo(chainId) {
    const chainName = Object.keys(CHAIN_CONFIG).find(
      name => CHAIN_CONFIG[name].chainId === chainId.toString()
    );
    
    if (!chainName) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    return {
      name: chainName,
      ...CHAIN_CONFIG[chainName],
      contractAddress: CONTRACT_ADDRESSES[chainId]
    };
  }

  // Cleanup resources
  async cleanup() {
    console.log('Cleaning up OKX DEX Service...');
    // Close any open connections if needed
    this.initialized = false;
  }
}

// Export singleton instance
module.exports = new OKXDexService(); 