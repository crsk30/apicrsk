#!/bin/bash
echo "Validating deployment..."

sleep 5

if pgrep -x "node" > /dev/null
then
  echo "✅ Node.js app is running."
  exit 0
else
  echo "❌ Node.js app failed to start."
  exit 1
fi
