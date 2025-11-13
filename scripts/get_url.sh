#!/usr/bin/bash

PUBLIC_IP=$(curl -s ip4.me/api/ | cut -d ',' -f 2)

if [ -n "$PUBLIC_IP" ]; then
  echo "     API: http://$PUBLIC_IP/"
  echo "API docs: http://$PUBLIC_IP/api"
else
  echo "Error: Could not retrieve public IP address from API." >&2
fi