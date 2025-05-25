const express = require('express');
const router = express.Router();
const okxDexService = require('./okx-dex-service');
const { ethers } = require('ethers');

// Middleware for async error handling
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Middleware for chain validation
const validateChain = (req, res, next) => {
  const chainId = req.params.chainId || req.body.chainId;
  if (!chainId) {
    return res.status(400).json({ error: 'Chain ID is required' });
  }
  
  try {
    okxDexService.getChainInfo(chainId);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'AgreeX API - OKX DEX Integration',
    version: '1.0.0',
    endpoints: {
      contracts: '/contracts',
      swap: '/swap',
      tokens: '/tokens',
      chains: '/chains'
    }
  });
});

// Get supported chains
router.get('/chains', (req, res) => {
  const chains = [
    { id: '1', name: 'Ethereum', symbol: 'ETH' },
    { id: '137', name: 'Polygon', symbol: 'MATIC' },
    { id: '42161', name: 'Arbitrum', symbol: 'ETH' },
    { id: '10', name: 'Optimism', symbol: 'ETH' },
    { id: '43114', name: 'Avalanche', symbol: 'AVAX' },
    { id: '56', name: 'BSC', symbol: 'BNB' }
  ];
  
  res.json({ chains });
});

// Get chain details
router.get('/chains/:chainId', validateChain, (req, res) => {
  const chainInfo = okxDexService.getChainInfo(req.params.chainId);
  res.json(chainInfo);
});

// Get supported tokens for a chain
router.get('/chains/:chainId/tokens', validateChain, asyncHandler(async (req, res) => {
  const tokens = await okxDexService.getSupportedTokens(req.params.chainId);
  res.json({ tokens });
}));

// Create a new contract
router.post('/contracts', validateChain, asyncHandler(async (req, res) => {
  const {
    chainId,
    contractId,
    freelancer,
    supervisor,
    paymentToken,
    milestones,
    totalAmount
  } = req.body;
  
  // Validate required fields
  if (!contractId || !freelancer || !supervisor || !milestones || !totalAmount) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['chainId', 'contractId', 'freelancer', 'supervisor', 'milestones', 'totalAmount']
    });
  }
  
  // Validate addresses
  if (!ethers.utils.isAddress(freelancer) || !ethers.utils.isAddress(supervisor)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }
  
  // Prepare milestone data
  const milestoneDescriptions = milestones.map(m => m.description);
  const milestoneAmounts = milestones.map(m => ethers.utils.parseEther(m.amount.toString()));
  
  const contractData = {
    contractId,
    freelancer,
    supervisor,
    paymentToken: paymentToken || ethers.constants.AddressZero,
    milestoneDescriptions,
    milestoneAmounts,
    totalAmount: ethers.utils.parseEther(totalAmount.toString())
  };
  
  const result = await okxDexService.createContract(chainId, contractData);
  
  res.status(201).json({
    success: true,
    ...result,
    explorerUrl: `${okxDexService.getChainInfo(chainId).explorer}/tx/${result.transactionHash}`
  });
}));

// Get contract details
router.get('/contracts/:chainId/:contractId', validateChain, asyncHandler(async (req, res) => {
  const { chainId, contractId } = req.params;
  
  const contract = await okxDexService.getContract(chainId, contractId);
  
  if (!contract || contract.createdAt === '0') {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  res.json({
    ...contract,
    chainId,
    explorerUrl: `${okxDexService.getChainInfo(chainId).explorer}/address/${contract.id}`
  });
}));

// Complete a milestone
router.post('/contracts/:chainId/:contractId/milestones/:milestoneIndex/complete', 
  validateChain, 
  asyncHandler(async (req, res) => {
    const { chainId, contractId, milestoneIndex } = req.params;
    
    const result = await okxDexService.completeMilestone(
      chainId,
      contractId,
      parseInt(milestoneIndex)
    );
    
    res.json({
      success: true,
      ...result,
      explorerUrl: `${okxDexService.getChainInfo(chainId).explorer}/tx/${result.transactionHash}`
    });
  })
);

// Get swap quote
router.post('/swap/quote', validateChain, asyncHandler(async (req, res) => {
  const { chainId, fromToken, toToken, amount } = req.body;
  
  if (!fromToken || !toToken || !amount) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['chainId', 'fromToken', 'toToken', 'amount']
    });
  }
  
  const quote = await okxDexService.getSwapQuote(
    chainId,
    fromToken,
    toToken,
    ethers.utils.parseEther(amount.toString()).toString()
  );
  
  res.json({
    ...quote,
    amountFormatted: ethers.utils.formatEther(quote.toTokenAmount),
    priceImpact: quote.priceImpact || '0.00%'
  });
}));

// Execute swap
router.post('/swap/execute', validateChain, asyncHandler(async (req, res) => {
  const { chainId, fromToken, toToken, amount, userAddress, slippage } = req.body;
  
  if (!fromToken || !toToken || !amount || !userAddress) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['chainId', 'fromToken', 'toToken', 'amount', 'userAddress']
    });
  }
  
  if (!ethers.utils.isAddress(userAddress)) {
    return res.status(400).json({ error: 'Invalid user address' });
  }
  
  const swapData = await okxDexService.executeSwap(
    chainId,
    fromToken,
    toToken,
    ethers.utils.parseEther(amount.toString()).toString(),
    userAddress,
    slippage
  );
  
  res.json({
    success: true,
    tx: swapData.tx,
    routerAddress: swapData.tx.to,
    estimatedGas: swapData.tx.gas,
    routes: swapData.routerResult.routes
  });
}));

// Swap and pay for milestone
router.post('/contracts/:chainId/:contractId/milestones/:milestoneIndex/swap-pay',
  validateChain,
  asyncHandler(async (req, res) => {
    const { chainId, contractId, milestoneIndex } = req.params;
    const { toToken, minReturn, pools, swapData } = req.body;
    
    if (!toToken || !minReturn) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['toToken', 'minReturn']
      });
    }
    
    const result = await okxDexService.swapAndPay(
      chainId,
      contractId,
      parseInt(milestoneIndex),
      toToken,
      {
        minReturn: ethers.utils.parseEther(minReturn.toString()).toString(),
        pools: pools || [],
        data: swapData || '0x'
      }
    );
    
    res.json({
      success: true,
      ...result,
      explorerUrl: `${okxDexService.getChainInfo(chainId).explorer}/tx/${result.transactionHash}`
    });
  })
);

// Cancel contract
router.post('/contracts/:chainId/:contractId/cancel',
  validateChain,
  asyncHandler(async (req, res) => {
    const { chainId, contractId } = req.params;
    
    const result = await okxDexService.cancelContract(chainId, contractId);
    
    res.json({
      success: true,
      ...result,
      explorerUrl: `${okxDexService.getChainInfo(chainId).explorer}/tx/${result.transactionHash}`
    });
  })
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    okxDexService: okxDexService.initialized ? 'connected' : 'disconnected'
  });
});

module.exports = router;
