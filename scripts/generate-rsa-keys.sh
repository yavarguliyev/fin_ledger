#!/bin/bash

set -e

KEYS_DIR="./keys"

PRIVATE_KEY_FILE="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY_FILE="$KEYS_DIR/jwt-public.pem"

echo "🔐 Generating RSA Key Pair for JWT Authentication..."
echo ""

mkdir -p "$KEYS_DIR"

# Generate RSA private key in PKCS#8 format
openssl genpkey \
  -algorithm RSA \
  -pkeyopt rsa_keygen_bits:2048 \
  -out "$PRIVATE_KEY_FILE" 2>/dev/null

echo "✅ Private key generated: $PRIVATE_KEY_FILE"

# Generate public key
openssl rsa \
  -in "$PRIVATE_KEY_FILE" \
  -pubout \
  -out "$PUBLIC_KEY_FILE" 2>/dev/null

echo "✅ Public key generated: $PUBLIC_KEY_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Add these to your .env file:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Convert real newlines to literal \n for .env
PRIVATE_KEY_ENV=$(awk '{printf "%s\\n", $0}' "$PRIVATE_KEY_FILE")
PUBLIC_KEY_ENV=$(awk '{printf "%s\\n", $0}' "$PUBLIC_KEY_FILE")

echo "JWT_PRIVATE_KEY=\"$PRIVATE_KEY_ENV\""
echo ""
echo "JWT_PUBLIC_KEY=\"$PUBLIC_KEY_ENV\""

echo ""
echo "JWT_EXPIRES_IN=7d"
echo "JWT_ISSUER=distributed-system"
echo "JWT_AUDIENCE=distributed-system-users"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  SECURITY NOTES:"
echo "   - Keep private key SECRET and NEVER commit it to version control"
echo "   - Add keys/ directory to .gitignore"
echo "   - Store keys securely (AWS Secrets Manager, Vault, etc.) in production"
echo "   - Use different keys for different environments (dev/staging/prod)"
echo ""

echo "📁 Key files are stored in: $KEYS_DIR/"
echo ""