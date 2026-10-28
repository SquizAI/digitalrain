#!/bin/bash
set -e

echo "============================================"
echo "  REPO ARCHITECTURE — Neo4j Graph Explorer"
echo "  DigitalRain Codebase Analysis"
echo "============================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null 2>&1; then
    echo "ERROR: Docker Compose is not available."
    exit 1
fi

echo "Starting Neo4j..."
docker compose up -d neo4j

echo "Waiting for Neo4j to be healthy..."
until docker inspect --format='{{.State.Health.Status}}' repo-architecture-graph 2>/dev/null | grep -q "healthy"; do
    sleep 2
    printf "."
done
echo ""
echo "Neo4j is ready!"

echo "Loading graph data..."
docker compose up graph-loader
docker compose rm -f graph-loader

echo ""

# Start a simple HTTP server for the chat page
echo "Starting chat interface on port 8080..."
if command -v python3 &> /dev/null; then
    cd "$(dirname "$0")"
    python3 -m http.server 8080 --bind 0.0.0.0 &
    CHAT_PID=$!
    echo "Chat server PID: $CHAT_PID"
elif command -v npx &> /dev/null; then
    cd "$(dirname "$0")"
    npx -y serve -l 8080 -s . &
    CHAT_PID=$!
else
    echo "NOTE: Install Python3 or npx to auto-serve the chat page"
    echo "      Or just open chat.html directly in your browser"
fi

echo ""
echo "============================================"
echo "  Neo4j + Chat Interface is running!"
echo ""
echo "  Chat UI:     http://localhost:8080/chat.html"
echo "  Neo4j UI:    http://localhost:7474"
echo "  Bolt URI:    bolt://localhost:7687"
echo "  Username:    neo4j"
echo "  Password:    repoanalysis"
echo ""
echo "  Useful queries in: scripts/useful-queries.cypher"
echo ""
echo "  To stop:  docker compose down"
echo "  To reset: docker compose down -v"
echo "============================================"
