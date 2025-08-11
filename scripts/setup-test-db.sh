#!/bin/bash

# Setup script for test database
# This script sets up a test PostgreSQL database for running integration tests

set -e

echo "Setting up test database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start test database
echo "Starting test database container..."
docker-compose up -d postgres-test

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec -T postgres-test pg_isready -U testuser -d testdb; do
    echo "Database is not ready yet. Waiting..."
    sleep 2
done

echo "Database is ready!"

# Create test environment file if it doesn't exist
if [ ! -f .env.test ]; then
    echo "Creating .env.test file..."
    cat > .env.test << EOF
# Test Database Configuration
TEST_DB_USER=testuser
TEST_DB_PASSWORD=testpass
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_NAME=testdb
TEST_DB_SCHEMA=public
EOF
    echo ".env.test file created. Please review and update if needed."
else
    echo ".env.test file already exists."
fi

echo "PostgreSQL Data Accessor test database setup complete!"
echo "You can now run integration tests with: npm run test:integration"
