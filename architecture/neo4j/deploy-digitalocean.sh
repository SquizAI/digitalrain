#!/bin/bash
set -e

# ============================================
# Deploy Architecture Explorer to DigitalOcean
# Creates a Droplet, installs Docker, and
# launches Neo4j + Chat via docker compose
# ============================================

# Config — change these
DROPLET_NAME="${DROPLET_NAME:-repo-architecture}"
REGION="${REGION:-nyc3}"
SIZE="${SIZE:-s-2vcpu-4gb}"  # 2 vCPU, 4GB RAM — good for Neo4j
IMAGE="${IMAGE:-docker-20-04}"  # Docker pre-installed on Ubuntu

echo "============================================"
echo "  DigitalOcean Deployment"
echo "  Droplet: $DROPLET_NAME"
echo "  Region:  $REGION"
echo "  Size:    $SIZE"
echo "============================================"
echo ""

# Check doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "ERROR: doctl (DigitalOcean CLI) is not installed."
    echo "Install: brew install doctl"
    echo "Then:    doctl auth init"
    exit 1
fi

# Check authentication
if ! doctl account get &> /dev/null; then
    echo "ERROR: doctl is not authenticated. Run: doctl auth init"
    exit 1
fi

# Create the droplet
echo "Creating droplet..."
DROPLET_IP=$(doctl compute droplet create "$DROPLET_NAME" \
    --region "$REGION" \
    --size "$SIZE" \
    --image "$IMAGE" \
    --tag-name "architecture-explorer" \
    --wait \
    --format PublicIPv4 \
    --no-header)

echo "Droplet created at: $DROPLET_IP"
echo "Waiting for SSH to be ready..."
sleep 30

# Copy files to the droplet
echo "Uploading files..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ssh -o StrictHostKeyChecking=no "root@$DROPLET_IP" "mkdir -p /opt/architecture/scripts"
scp "$SCRIPT_DIR/docker-compose.yml" "root@$DROPLET_IP:/opt/architecture/"
scp "$SCRIPT_DIR/Dockerfile.chat" "root@$DROPLET_IP:/opt/architecture/"
scp "$SCRIPT_DIR/requirements.txt" "root@$DROPLET_IP:/opt/architecture/"
scp "$SCRIPT_DIR/extract_and_load.py" "root@$DROPLET_IP:/opt/architecture/"
scp "$SCRIPT_DIR/chat.html" "root@$DROPLET_IP:/opt/architecture/"
scp "$SCRIPT_DIR/scripts/"*.cypher "root@$DROPLET_IP:/opt/architecture/scripts/"

# Start services on the droplet
echo "Starting services..."
ssh "root@$DROPLET_IP" << 'REMOTE'
cd /opt/architecture

# Open firewall ports
ufw allow 7474/tcp   # Neo4j Browser
ufw allow 7687/tcp   # Neo4j Bolt
ufw allow 8080/tcp   # Chat UI

# Start everything
docker compose up -d neo4j chat

# Wait for Neo4j health
echo "Waiting for Neo4j..."
sleep 30

# Load graph data
docker compose up graph-loader
docker compose rm -f graph-loader

echo "Services are running!"
REMOTE

echo ""
echo "============================================"
echo "  Deployment complete!"
echo ""
echo "  Chat UI:   http://$DROPLET_IP:8080/chat.html"
echo "  Neo4j UI:  http://$DROPLET_IP:7474"
echo "  Bolt URI:  bolt://$DROPLET_IP:7687"
echo "  Username:  neo4j"
echo "  Password:  repoanalysis"
echo ""
echo "  SSH:       ssh root@$DROPLET_IP"
echo "  Destroy:   doctl compute droplet delete $DROPLET_NAME"
echo "============================================"
