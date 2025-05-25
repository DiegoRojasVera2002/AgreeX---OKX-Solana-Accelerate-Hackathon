#!/bin/bash

# Script para configurar cuentas y wallets para AgreeX con OKX DEX
# Este script genera wallets EVM compatibles para usar en múltiples chains

echo "==================================="
echo "AgreeX - OKX DEX Account Setup"
echo "==================================="

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si se pasó un identificador
if [ -z "$1" ]; then
  echo -e "${YELLOW}Uso: $0 <identificador-proyecto>${NC}"
  echo "Ejemplo: $0 hackathon-2025"
  exit 1
fi

PROJECT_ID="$1"
OUTPUT_DIR="./accounts-$PROJECT_ID"

# Crear directorio para guardar las credenciales
mkdir -p "$OUTPUT_DIR"

# Función para generar una wallet EVM
generate_evm_wallet() {
  local role=$1
  local wallet_name="${role}-${PROJECT_ID}"
  
  echo -e "\n${BLUE}Generando wallet para: ${wallet_name}${NC}"
  
  # Usar node.js para generar wallet (requiere ethers.js instalado globalmente)
  node -e "
    const { ethers } = require('ethers');
    const wallet = ethers.Wallet.createRandom();
    
    const walletInfo = {
      role: '${role}',
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase,
      projectId: '${PROJECT_ID}'
    };
    
    console.log(JSON.stringify(walletInfo, null, 2));
  " > "$OUTPUT_DIR/${wallet_name}.json"
  
  # Mostrar información básica
  local address=$(cat "$OUTPUT_DIR/${wallet_name}.json" | grep -o '"address": "[^"]*' | grep -o '[^"]*$')
  echo -e "${GREEN}✓ Wallet creada: ${address}${NC}"
}

# Verificar si ethers está instalado
if ! npm list -g ethers &> /dev/null; then
  echo -e "${YELLOW}Instalando ethers.js globalmente...${NC}"
  npm install -g ethers
fi

echo -e "\n${BLUE}Generando wallets para AgreeX...${NC}"

# Generar wallets para cada rol
declare -a roles=("employer" "freelancer" "supervisor" "platform" "treasury")

for role in "${roles[@]}"; do
  generate_evm_wallet "$role"
done

# Crear archivo .env de ejemplo
echo -e "\n${BLUE}Creando archivo .env de ejemplo...${NC}"

cat > "$OUTPUT_DIR/.env.example" << EOF
# AgreeX - OKX DEX Configuration
# Project ID: $PROJECT_ID

# OKX API Credentials
OKX_API_KEY=your_okx_api_key_here
OKX_SECRET_KEY=your_okx_secret_key_here
OKX_PASSPHRASE=your_okx_passphrase_here
OKX_PROJECT_ID=agreex-$PROJECT_ID

# Wallet Private Keys (DO NOT COMMIT!)
EOF

# Agregar private keys al .env
for role in "${roles[@]}"; do
  wallet_file="$OUTPUT_DIR/${role}-${PROJECT_ID}.json"
  if [ -f "$wallet_file" ]; then
    private_key=$(cat "$wallet_file" | grep -o '"privateKey": "[^"]*' | grep -o '[^"]*$')
    address=$(cat "$wallet_file" | grep -o '"address": "[^"]*' | grep -o '[^"]*$')
    
    echo "" >> "$OUTPUT_DIR/.env.example"
    echo "# ${role^} Wallet" >> "$OUTPUT_DIR/.env.example"
    echo "${role^^}_ADDRESS=$address" >> "$OUTPUT_DIR/.env.example"
    echo "${role^^}_PRIVATE_KEY=$private_key" >> "$OUTPUT_DIR/.env.example"
  fi
done

# Agregar configuración de chains
cat >> "$OUTPUT_DIR/.env.example" << EOF

# Chain RPC URLs
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Contract Addresses (update after deployment)
ETH_CONTRACT_ADDRESS=
POLYGON_CONTRACT_ADDRESS=
ARBITRUM_CONTRACT_ADDRESS=
OPTIMISM_CONTRACT_ADDRESS=
AVALANCHE_CONTRACT_ADDRESS=
BSC_CONTRACT_ADDRESS=
EOF

# Crear resumen de cuentas
echo -e "\n${BLUE}Creando resumen de cuentas...${NC}"

cat > "$OUTPUT_DIR/accounts-summary.txt" << EOF
AgreeX Account Summary
Project ID: $PROJECT_ID
Generated: $(date)

Wallet Addresses:
================
EOF

for role in "${roles[@]}"; do
  wallet_file="$OUTPUT_DIR/${role}-${PROJECT_ID}.json"
  if [ -f "$wallet_file" ]; then
    address=$(cat "$wallet_file" | grep -o '"address": "[^"]*' | grep -o '[^"]*$')
    echo "${role^}: $address" >> "$OUTPUT_DIR/accounts-summary.txt"
  fi
done

cat >> "$OUTPUT_DIR/accounts-summary.txt" << EOF

Supported Chains:
================
- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)
- Avalanche (Chain ID: 43114)
- BSC (Chain ID: 56)

OKX DEX Integration:
===================
- Aggregator Address: 0x1111111254EEB25477B68fb85Ed929f73A960582
- API Version: v5
- Documentation: https://www.okx.com/docs-v5/en/

IMPORTANT NOTES:
===============
1. Keep your private keys secure and NEVER commit them to git
2. Fund your wallets on the chains you want to use
3. Configure OKX API credentials before deployment
4. Update contract addresses after deployment
EOF

echo -e "\n${GREEN}✅ Setup completado!${NC}"
echo -e "${BLUE}Archivos generados en: ${OUTPUT_DIR}${NC}"
echo -e "\n${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. Guarda las private keys de forma segura"
echo "2. Nunca compartas ni subas las private keys a git"
echo "3. Fondea las wallets en las chains que vayas a usar"
echo "4. Configura las credenciales de OKX API antes del deployment"
echo -e "\n${GREEN}Siguiente paso: cp $OUTPUT_DIR/.env.example mvp/interface/.env${NC}" 