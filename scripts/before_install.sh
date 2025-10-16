#!/bin/bash
echo "BeforeInstall: stopping existing app and cleaning up"

# Stop any running app
pm2 stop all || true

# Clean up old files
rm -rf /home/ubuntu/my-node-app
mkdir -p /home/ubuntu/my-node-app
