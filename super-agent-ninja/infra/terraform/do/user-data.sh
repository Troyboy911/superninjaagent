#!/bin/bash

# Update system
apt-get update
apt-get install -y curl git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository
cd /opt
git clone https://github.com/${project_name}/super-agent-ninja.git app
cd app

# Create .env file
cat > .env << EOF
NODE_ENV=production
AGENT_DOMAIN=${agent_domain}
EOF

# Create systemd service
cat > /etc/systemd/system/super-agent.service << EOF
[Unit]
Description=Super Agent Ninja
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable super-agent.service
systemctl start super-agent.service