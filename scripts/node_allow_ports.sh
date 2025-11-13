#!/usr/bin/bash

# Allow Node.js to bind to ports normally only bindable by superuser processes.
sudo setcap cap_net_bind_service=+ep $(which node)