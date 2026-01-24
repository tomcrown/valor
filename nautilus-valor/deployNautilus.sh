#!/bin/bash

# Valor Nautilus Enclave Deployment Script
# This script automates the deployment of the Nautilus oracle enclave

set -e

echo "🚀 Valor Nautilus Oracle Deployment"
echo "===================================="

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed. Aborting."; exit 1; }
command -v sui >/dev/null 2>&1 || { echo "❌ Sui CLI not installed. Aborting."; exit 1; }

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

# Validate required env vars
if [ -z "$ALLSPORTS_API_KEY" ]; then
    echo "❌ ALLSPORTS_API_KEY not set in .env"
    exit 1
fi

if [ -z "$VITE_OPENAI_API_KEY" ]; then
    echo "❌ VITE_OPENAI_API_KEY not set in .env"
    exit 1
fi

if [ -z "$AWS_KEY_PAIR" ]; then
    echo "❌ AWS_KEY_PAIR not set in .env"
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Step 1: Clone Nautilus repo (if not exists)
if [ ! -d "nautilus" ]; then
    echo "📦 Cloning Nautilus repository..."
    git clone https://github.com/MystenLabs/nautilus.git
    cd nautilus
else
    echo "📦 Using existing Nautilus repository"
    cd nautilus
    git pull
fi

# Step 2: Copy Valor oracle code into Nautilus
echo "📝 Setting up Valor oracle in Nautilus..."

# Create valor-oracle app directory
mkdir -p src/nautilus-server/src/apps/valor-oracle

# Copy the mod.rs and allowed_endpoints.yaml (assume they're in ../nautilus-valor/)
if [ -d "../nautilus-valor" ]; then
    cp ../nautilus-valor/mod.rs src/nautilus-server/src/apps/valor-oracle/
    cp ../nautilus-valor/allowed_endpoints.yaml src/nautilus-server/src/apps/valor-oracle/
    echo "✅ Valor oracle code copied"
else
    echo "⚠️  ../nautilus-valor directory not found. Please ensure mod.rs and allowed_endpoints.yaml are in place."
    echo "   You can create them manually in src/nautilus-server/src/apps/valor-oracle/"
    read -p "Press enter to continue or Ctrl+C to abort..."
fi

# Step 3: Configure AWS credentials
echo "🔑 Configuring AWS..."
aws configure list
echo ""

# Step 4: Set environment variables for Nautilus
export KEY_PAIR=$AWS_KEY_PAIR
export REGION=${AWS_REGION:-us-east-1}

echo "📋 Configuration:"
echo "   Key Pair: $KEY_PAIR"
echo "   Region: $REGION"
echo ""

# Step 5: Run Nautilus provisioning script
echo "🚀 Provisioning Nautilus enclave (this may take 5-10 minutes)..."
sh configure_enclave.sh valor-oracle <<EOF
valor-oracle
y
new
allsports-api-key
$ALLSPORTS_API_KEY
EOF

# The script will output the EC2 instance ID and IP
# Save these for later

echo ""
echo "⏳ Waiting for EC2 initialization (2 minutes)..."
sleep 120

# Step 6: Get the public IP
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=valor-oracle*" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text)

PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "✅ Enclave deployed!"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IP: $PUBLIC_IP"
echo ""

# Step 7: Copy Nautilus directory to EC2
echo "📤 Copying Nautilus code to EC2..."
rsync -avz -e "ssh -i ~/.ssh/${KEY_PAIR}.pem" \
    ./ \
    ec2-user@${PUBLIC_IP}:~/nautilus/

echo "✅ Code copied to EC2"
echo ""

# Step 8: SSH into EC2 and build the enclave
echo "🔨 Building enclave on EC2..."
ssh -i ~/.ssh/${KEY_PAIR}.pem ec2-user@${PUBLIC_IP} << 'ENDSSH'
cd nautilus
make ENCLAVE_APP=valor-oracle
make run
sh expose_enclave.sh &
ENDSSH

echo "✅ Enclave built and running!"
echo ""

# Step 9: Test the enclave
echo "🧪 Testing enclave..."
sleep 5

# Health check
HEALTH=$(curl -s -H 'Content-Type: application/json' -X GET http://${PUBLIC_IP}:3000/health_check)
echo "Health check: $HEALTH"

# Test process_data
TEST_RESPONSE=$(curl -s -H 'Content-Type: application/json' \
    -d '{"payload": {"player_name": "Erling Haaland", "player_id": "0x123", "season": "current", "league_id": 152}}' \
    -X POST http://${PUBLIC_IP}:3000/process_data)

echo "Test response:"
echo $TEST_RESPONSE | jq '.'

# Step 10: Get attestation for on-chain registration
echo ""
echo "🔐 Getting enclave attestation..."
ATTESTATION=$(curl -s -H 'Content-Type: application/json' -X GET http://${PUBLIC_IP}:3000/get_attestation)
echo "Attestation retrieved (length: ${#ATTESTATION})"

# Step 11: Get PCR values
echo ""
echo "📊 Getting PCR values..."
ssh -i ~/.ssh/${KEY_PAIR}.pem ec2-user@${PUBLIC_IP} << 'ENDSSH'
cd nautilus
make ENCLAVE_APP=valor-oracle
cat out/nitro.pcrs
ENDSSH

# Step 12: Instructions for on-chain registration
echo ""
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Save the enclave URL to .env:"
echo "   NAUTILUS_ENCLAVE_URL=http://${PUBLIC_IP}:3000"
echo ""
echo "2. Deploy the Nautilus Move contract:"
echo "   cd contracts"
echo "   sui client publish"
echo ""
echo "3. Register the enclave on-chain:"
echo "   ts-node scripts/registerNautilusEnclave.ts"
echo ""
echo "4. Update your players using Nautilus:"
echo "   ts-node scripts/updateWithNautilus.ts --season current"
echo ""
echo "🎉 Your Valor oracle is now running in a secure Nautilus enclave!"
echo ""
echo "⚠️  Remember to stop your EC2 instance when done to avoid charges:"
echo "   aws ec2 stop-instances --instance-ids $INSTANCE_ID"