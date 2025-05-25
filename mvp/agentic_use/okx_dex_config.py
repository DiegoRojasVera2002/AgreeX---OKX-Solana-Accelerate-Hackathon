"""
OKX DEX API Configuration for AgreeX Platform
Handles authentication and endpoint configuration for OKX DEX integration
"""

import os
from typing import Dict, Optional
import hmac
import base64
import hashlib
import time

class OKXDEXConfig:
    """Configuration manager for OKX DEX API integration"""
    
    # OKX DEX API Endpoints
    BASE_URL = "https://www.okx.com"
    DEX_API_VERSION = "/api/v5/dex"
    
    # Supported chains on OKX DEX
    SUPPORTED_CHAINS = {
        "ethereum": {
            "chainId": "1",
            "name": "Ethereum Mainnet",
            "nativeCurrency": "ETH",
            "rpcUrl": "https://eth-mainnet.g.alchemy.com/v2/",
            "explorerUrl": "https://etherscan.io"
        },
        "polygon": {
            "chainId": "137",
            "name": "Polygon",
            "nativeCurrency": "MATIC",
            "rpcUrl": "https://polygon-rpc.com",
            "explorerUrl": "https://polygonscan.com"
        },
        "arbitrum": {
            "chainId": "42161",
            "name": "Arbitrum One",
            "nativeCurrency": "ETH",
            "rpcUrl": "https://arb1.arbitrum.io/rpc",
            "explorerUrl": "https://arbiscan.io"
        },
        "optimism": {
            "chainId": "10",
            "name": "Optimism",
            "nativeCurrency": "ETH",
            "rpcUrl": "https://mainnet.optimism.io",
            "explorerUrl": "https://optimistic.etherscan.io"
        },
        "avalanche": {
            "chainId": "43114",
            "name": "Avalanche C-Chain",
            "nativeCurrency": "AVAX",
            "rpcUrl": "https://api.avax.network/ext/bc/C/rpc",
            "explorerUrl": "https://snowtrace.io"
        },
        "bsc": {
            "chainId": "56",
            "name": "BNB Smart Chain",
            "nativeCurrency": "BNB",
            "rpcUrl": "https://bsc-dataseed.binance.org",
            "explorerUrl": "https://bscscan.com"
        }
    }
    
    # AgreeX specific endpoints
    AGREEX_ENDPOINTS = {
        "contract_verification": f"{DEX_API_VERSION}/aggregator/contract/verify",
        "milestone_check": f"{DEX_API_VERSION}/aggregator/milestone/status",
        "payment_release": f"{DEX_API_VERSION}/aggregator/payment/release",
        "cross_chain_verify": f"{DEX_API_VERSION}/aggregator/cross-chain/verify"
    }
    
    def __init__(self):
        self.api_key = os.environ.get('OKX_API_KEY', '')
        self.secret_key = os.environ.get('OKX_SECRET_KEY', '')
        self.passphrase = os.environ.get('OKX_PASSPHRASE', '')
        self.project_id = os.environ.get('OKX_PROJECT_ID', 'agreex-contracts')
        self.simulate_mode = os.environ.get('OKX_SIMULATE_MODE', 'true').lower() == 'true'
    
    def generate_signature(self, timestamp: str, method: str, request_path: str, body: str = '') -> str:
        """
        Generate OKX API signature for authentication
        Following OKX DEX API signature requirements
        """
        if self.simulate_mode:
            # In simulation mode, return a mock signature
            return base64.b64encode(f"mock-signature-{timestamp}".encode()).decode()
        
        # Create the prehash string
        prehash = timestamp + method.upper() + request_path + body
        
        # Create signature
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            prehash.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        return base64.b64encode(signature).decode()
    
    def get_headers(self, method: str, request_path: str, body: str = '') -> Dict[str, str]:
        """
        Generate headers required for OKX DEX API requests
        """
        timestamp = str(int(time.time() * 1000))
        
        return {
            'OK-ACCESS-KEY': self.api_key,
            'OK-ACCESS-SIGN': self.generate_signature(timestamp, method, request_path, body),
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': self.passphrase,
            'OK-ACCESS-PROJECT-ID': self.project_id,
            'Content-Type': 'application/json',
            'x-simulated-trading': '1' if self.simulate_mode else '0'
        }
    
    def get_aggregator_params(self, chain_id: str, amount: str, from_token: str, to_token: str) -> Dict[str, str]:
        """
        Get parameters for OKX DEX Aggregator swap
        """
        return {
            "chainId": chain_id,
            "amount": amount,
            "fromTokenAddress": from_token,
            "toTokenAddress": to_token,
            "slippage": "0.5",  # 0.5% slippage
            "userWalletAddress": os.environ.get('USER_WALLET_ADDRESS', '0x...'),
            "referrerAddress": "0x0000000000000000000000000000000000000000",  # AgreeX referrer
            "feePercent": "0.1"  # 0.1% fee for AgreeX
        }
    
    def validate_chain(self, chain_name: str) -> bool:
        """Validate if chain is supported by OKX DEX"""
        return chain_name.lower() in self.SUPPORTED_CHAINS
    
    def get_chain_config(self, chain_name: str) -> Optional[Dict[str, str]]:
        """Get configuration for a specific chain"""
        return self.SUPPORTED_CHAINS.get(chain_name.lower())

# Singleton instance
okx_config = OKXDEXConfig() 