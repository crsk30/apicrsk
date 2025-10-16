#!/bin/bash
echo "Starting Node.js app with PM2"

cd /home/ubuntu/my-node-app

# Install PM2 if not available
if ! command -v pm2 &> /dev/null
then
  sudo npm install -g pm2
fi

# Start or restart app
pm2 start index.js --name "my-node-app" || pm2 restart "my-node-app"
pm2 save
