"""
OKX DEX Utilities for AgreeX Smart Contract Platform
Handles DEX operations, cross-chain verification, and payment automation
"""

import json
import time
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import requests
from okx_dex_config import okx_config

class OKXDEXClient:
    """Client for interacting with OKX DEX API"""
    
    def __init__(self):
        self.config = okx_config
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'AgreeX/1.0 OKX-DEX-Integration'
        })
    
    def get_quote(self, chain_id: str, from_token: str, to_token: str, amount: str) -> Dict:
        """
        Get swap quote from OKX DEX Aggregator
        Used for calculating payment amounts in different tokens
        """
        endpoint = f"{self.config.BASE_URL}{self.config.DEX_API_VERSION}/aggregator/quote"
        
        params = {
            "chainId": chain_id,
            "fromTokenAddress": from_token,
            "toTokenAddress": to_token,
            "amount": amount,
            "slippage": "0.5"
        }
        
        headers = self.config.get_headers("GET", endpoint, "")
        
        if self.config.simulate_mode:
            # Simulate quote response
            return {
                "code": "0",
                "data": [{
                    "routerResult": {
                        "fromTokenAmount": amount,
                        "toTokenAmount": str(int(float(amount) * 0.95)),  # Simulate 5% price impact
                        "routes": [
                            {
                                "percentage": 70,
                                "subRoutes": [{
                                    "dex": "OKX-Pool",
                                    "percentage": 100
                                }]
                            },
                            {
                                "percentage": 30,
                                "subRoutes": [{
                                    "dex": "Uniswap V3",
                                    "percentage": 100
                                }]
                            }
                        ]
                    },
                    "tx": {
                        "data": "0x...",  # Simulated transaction data
                        "to": "0x1111111254fb6c44bac0bed2854e76f90643097d",  # OKX Aggregator contract
                        "value": "0",
                        "gas": "250000"
                    }
                }]
            }
        
        response = self.session.get(endpoint, params=params, headers=headers)
        return response.json()
    
    def verify_contract_deployment(self, chain_id: str, contract_address: str) -> Dict:
        """
        Verify smart contract deployment on specified chain
        """
        endpoint = f"{self.config.BASE_URL}{self.config.AGREEX_ENDPOINTS['contract_verification']}"
        
        payload = {
            "chainId": chain_id,
            "contractAddress": contract_address,
            "verificationType": "agreex-standard"
        }
        
        headers = self.config.get_headers("POST", endpoint, json.dumps(payload))
        
        if self.config.simulate_mode:
            return {
                "code": "0",
                "data": {
                    "verified": True,
                    "contractType": "AgreeX-Escrow-V1",
                    "deploymentBlock": 18900000 + int(time.time() % 10000),
                    "verificationHash": f"0x{'a' * 64}",
                    "features": ["escrow", "milestone-based", "cross-chain"]
                }
            }
        
        response = self.session.post(endpoint, json=payload, headers=headers)
        return response.json()
    
    def check_milestone_completion(self, contract_address: str, milestone_id: int, chain_id: str) -> Dict:
        """
        Check if a specific milestone has been completed on-chain
        """
        endpoint = f"{self.config.BASE_URL}{self.config.AGREEX_ENDPOINTS['milestone_check']}"
        
        params = {
            "contractAddress": contract_address,
            "milestoneId": str(milestone_id),
            "chainId": chain_id
        }
        
        headers = self.config.get_headers("GET", endpoint, "")
        
        if self.config.simulate_mode:
            return {
                "code": "0",
                "data": {
                    "milestoneId": milestone_id,
                    "status": "pending",  # or "completed"
                    "verificationProof": f"0x{'b' * 64}",
                    "timestamp": int(time.time()),
                    "gasUsed": "150000"
                }
            }
        
        response = self.session.get(endpoint, params=params, headers=headers)
        return response.json()
    
    def initiate_payment_release(self, contract_address: str, milestone_id: int, 
                                chain_id: str, recipient: str, amount: str) -> Dict:
        """
        Initiate payment release for completed milestone
        """
        endpoint = f"{self.config.BASE_URL}{self.config.AGREEX_ENDPOINTS['payment_release']}"
        
        payload = {
            "contractAddress": contract_address,
            "milestoneId": milestone_id,
            "chainId": chain_id,
            "recipient": recipient,
            "amount": amount,
            "tokenAddress": "0x0000000000000000000000000000000000000000",  # Native token
            "releaseType": "milestone-completion"
        }
        
        headers = self.config.get_headers("POST", endpoint, json.dumps(payload))
        
        if self.config.simulate_mode:
            return {
                "code": "0",
                "data": {
                    "transactionHash": f"0x{'c' * 64}",
                    "status": "pending",
                    "estimatedConfirmation": 15,  # seconds
                    "paymentId": f"PAY-{int(time.time())}",
                    "okxDexRoute": {
                        "protocol": "OKX-DEX-AGGREGATOR",
                        "gasOptimized": True
                    }
                }
            }
        
        response = self.session.post(endpoint, json=payload, headers=headers)
        return response.json()
    
    def verify_cross_chain_condition(self, source_chain: str, target_chain: str, 
                                   condition_hash: str) -> Dict:
        """
        Verify conditions across different chains using OKX DEX cross-chain infrastructure
        """
        endpoint = f"{self.config.BASE_URL}{self.config.AGREEX_ENDPOINTS['cross_chain_verify']}"
        
        payload = {
            "sourceChainId": self.config.SUPPORTED_CHAINS[source_chain]["chainId"],
            "targetChainId": self.config.SUPPORTED_CHAINS[target_chain]["chainId"],
            "conditionHash": condition_hash,
            "verificationType": "merkle-proof"
        }
        
        headers = self.config.get_headers("POST", endpoint, json.dumps(payload))
        
        if self.config.simulate_mode:
            return {
                "code": "0",
                "data": {
                    "verified": True,
                    "sourceBlockNumber": 18900000,
                    "targetBlockNumber": 52000000,
                    "bridgeProtocol": "OKX-Bridge",
                    "verificationTime": 45,  # seconds
                    "proof": f"0x{'d' * 128}"
                }
            }
        
        response = self.session.post(endpoint, json=payload, headers=headers)
        return response.json()

class AgreeXContractManager:
    """Manages AgreeX contracts on OKX DEX ecosystem"""
    
    def __init__(self):
        self.dex_client = OKXDEXClient()
        self.contract_cache = {}
    
    def create_escrow_contract(self, employer: str, freelancer: str, 
                             amount: str, token: str, chain: str, 
                             milestones: List[Dict]) -> Dict:
        """
        Create a new escrow contract on OKX DEX
        """
        # Validate chain
        if not okx_config.validate_chain(chain):
            raise ValueError(f"Unsupported chain: {chain}")
        
        chain_config = okx_config.get_chain_config(chain)
        
        # Simulate contract creation
        contract_address = f"0x{'e' * 40}"
        
        contract_data = {
            "address": contract_address,
            "chainId": chain_config["chainId"],
            "employer": employer,
            "freelancer": freelancer,
            "totalAmount": amount,
            "token": token,
            "milestones": milestones,
            "createdAt": int(time.time()),
            "status": "active",
            "okxDexIntegration": {
                "enabled": True,
                "aggregatorVersion": "v5",
                "crossChainEnabled": True
            }
        }
        
        # Cache contract data
        self.contract_cache[contract_address] = contract_data
        
        # Verify deployment
        verification = self.dex_client.verify_contract_deployment(
            chain_config["chainId"], 
            contract_address
        )
        
        contract_data["verification"] = verification.get("data", {})
        
        return {
            "success": True,
            "contract": contract_data,
            "explorerUrl": f"{chain_config['explorerUrl']}/address/{contract_address}"
        }
    
    def process_milestone_completion(self, contract_address: str, 
                                   milestone_index: int) -> Dict:
        """
        Process milestone completion and trigger payment if conditions are met
        """
        contract = self.contract_cache.get(contract_address)
        if not contract:
            return {"success": False, "error": "Contract not found"}
        
        milestone = contract["milestones"][milestone_index]
        
        # Check milestone status
        status = self.dex_client.check_milestone_completion(
            contract_address,
            milestone_index,
            contract["chainId"]
        )
        
        if status.get("data", {}).get("status") == "completed":
            # Initiate payment release
            payment_result = self.dex_client.initiate_payment_release(
                contract_address,
                milestone_index,
                contract["chainId"],
                contract["freelancer"],
                milestone["amount"]
            )
            
            return {
                "success": True,
                "milestone": milestone_index,
                "paymentStatus": payment_result.get("data", {}),
                "message": f"Payment of {milestone['amount']} initiated via OKX DEX"
            }
        
        return {
            "success": False,
            "milestone": milestone_index,
            "status": status.get("data", {}).get("status", "unknown"),
            "message": "Milestone not yet completed"
        }

# Export main components
__all__ = ['OKXDEXClient', 'AgreeXContractManager'] 