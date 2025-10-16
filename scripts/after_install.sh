#!/bin/bash
echo "AfterInstall: installing dependencies"

cd /home/ubuntu/my-node-app

# Install Node.js if not present
if ! command -v node &> /dev/null
then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
fi

npm install
