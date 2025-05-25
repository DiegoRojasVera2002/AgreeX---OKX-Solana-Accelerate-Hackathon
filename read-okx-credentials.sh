#!/bin/bash

# Script para leer y mostrar credenciales de AgreeX con OKX DEX
# Este script muestra las credenciales de forma segura para verificación

echo "======================================="
echo "AgreeX - OKX DEX Credentials Reader"
echo "======================================="

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si se pasó un identificador
if [ -z "$1" ]; then
  echo -e "${YELLOW}Uso: $0 <identificador-proyecto>${NC}"
  echo "Ejemplo: $0 hackathon-2025"
  exit 1
fi

PROJECT_ID="$1"
ACCOUNTS_DIR="./accounts-$PROJECT_ID"

# Verificar si existe el directorio
if [ ! -d "$ACCOUNTS_DIR" ]; then
  echo -e "${RED}Error: No se encontró el directorio $ACCOUNTS_DIR${NC}"
  echo "Ejecuta primero: ./setup-okx-accounts.sh $PROJECT_ID"
  exit 1
fi

echo -e "\n${BLUE}Leyendo credenciales para proyecto: $PROJECT_ID${NC}"

# Función para mostrar información de wallet
show_wallet_info() {
  local role=$1
  local wallet_file="$ACCOUNTS_DIR/${role}-${PROJECT_ID}.json"
  
  if [ -f "$wallet_file" ]; then
    echo -e "\n${GREEN}=== ${role^} Wallet ===${NC}"
    
    # Extraer información del JSON
    local address=$(cat "$wallet_file" | grep -o '"address": "[^"]*' | grep -o '[^"]*$')
    local private_key=$(cat "$wallet_file" | grep -o '"privateKey": "[^"]*' | grep -o '[^"]*$')
    local mnemonic=$(cat "$wallet_file" | grep -o '"mnemonic": "[^"]*' | grep -o '[^"]*$')
    
    echo -e "${BLUE}Address:${NC} $address"
    
    # Mostrar private key parcialmente oculta
    if [ "$2" == "--show-private" ]; then
      echo -e "${BLUE}Private Key:${NC} $private_key"
      echo -e "${BLUE}Mnemonic:${NC} $mnemonic"
    else
      local hidden_key="${private_key:0:10}...${private_key: -6}"
      echo -e "${BLUE}Private Key:${NC} $hidden_key ${YELLOW}(use --show-private para ver completa)${NC}"
    fi
    
    # Mostrar links a explorers
    echo -e "${BLUE}Explorers:${NC}"
    echo "  - Etherscan: https://etherscan.io/address/$address"
    echo "  - Polygonscan: https://polygonscan.com/address/$address"
    echo "  - Arbiscan: https://arbiscan.io/address/$address"
  else
    echo -e "\n${YELLOW}No se encontró wallet para: $role${NC}"
  fi
}

# Mostrar información de todas las wallets
declare -a roles=("employer" "freelancer" "supervisor" "platform" "treasury")

echo -e "\n${BLUE}📋 Wallets Generadas:${NC}"
for role in "${roles[@]}"; do
  show_wallet_info "$role" "$2"
done

# Mostrar configuración de OKX si existe .env
ENV_FILE="$ACCOUNTS_DIR/.env.example"
if [ -f "$ENV_FILE" ]; then
  echo -e "\n${BLUE}🔑 Configuración OKX DEX:${NC}"
  echo -e "${YELLOW}Archivo .env de ejemplo: $ENV_FILE${NC}"
  
  # Mostrar solo las líneas de OKX
  echo -e "\n${GREEN}Variables OKX requeridas:${NC}"
  grep "OKX_" "$ENV_FILE" | grep -v "="$ | while read line; do
    echo "  $line"
  done
fi

# Mostrar resumen
if [ -f "$ACCOUNTS_DIR/accounts-summary.txt" ]; then
  echo -e "\n${BLUE}📄 Resumen completo disponible en:${NC}"
  echo "$ACCOUNTS_DIR/accounts-summary.txt"
fi

# Verificar balances (opcional)
if [ "$3" == "--check-balance" ]; then
  echo -e "\n${BLUE}💰 Verificando balances...${NC}"
  echo -e "${YELLOW}Esta función requiere conexión a las RPCs${NC}"
  
  # Aquí podrías agregar código para verificar balances usando ethers.js o web3.js
  echo "Función no implementada aún"
fi

echo -e "\n${GREEN}✅ Lectura completada${NC}"

# Mostrar advertencias de seguridad
echo -e "\n${RED}⚠️  ADVERTENCIAS DE SEGURIDAD:${NC}"
echo "1. Nunca compartas tus private keys"
echo "2. No subas archivos con credenciales a git"
echo "3. Usa variables de entorno en producción"
echo "4. Mantén tus wallets con fondos mínimos para testing"

# Mostrar siguiente paso
echo -e "\n${BLUE}📌 Siguientes pasos:${NC}"
echo "1. Configura las credenciales de OKX API"
echo "2. Fondea las wallets en las chains que uses"
echo "3. Despliega los contratos con: cd mvp/ezcontract && npx hardhat run scripts/deploy.js"
echo "4. Actualiza las direcciones de contratos en el .env" 