#!/bin/bash

# Cleanup script for test database
# This script stops and removes the test PostgreSQL database container

set -e

echo "Cleaning up test database..."

# Stop and remove test database container
echo "Stopping test database container..."
docker-compose stop postgres-test

echo "Removing test database container..."
docker-compose rm -f postgres-test

echo "PostgreSQL Data Accessor test database cleanup complete!"
