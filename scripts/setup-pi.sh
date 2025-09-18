#!/bin/bash

# Vikas Raspberry Pi Setup Script
# This script sets up a Raspberry Pi to run the Vikas learning platform

set -e

echo "🚀 Starting Vikas Raspberry Pi setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker pi
rm get-docker.sh

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo apt install -y python3-pip
sudo pip3 install docker-compose

# Create Vikas directory
echo "📁 Setting up Vikas directory..."
mkdir -p /home/pi/vikas
cd /home/pi/vikas

# Download Vikas files
echo "⬇️  Downloading Vikas platform..."
# In production, this would download from a release
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    image: vikas/frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: vikas/backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - COUCHDB_URL=http://couchdb:5984
    depends_on:
      - couchdb
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  couchdb:
    image: couchdb:3.3
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=admin
    volumes:
      - couchdb_data:/opt/couchdb/data
    restart: unless-stopped

volumes:
  couchdb_data:
  uploads:
EOF

# Set up WiFi hotspot (optional)
echo "📶 Setting up WiFi hotspot..."
sudo apt install -y hostapd dnsmasq

# Configure hostapd
sudo tee /etc/hostapd/hostapd.conf > /dev/null << EOF
interface=wlan0
driver=nl80211
ssid=Vikas-Learning
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=vikas123
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
EOF

# Configure dnsmasq
sudo tee -a /etc/dnsmasq.conf > /dev/null << EOF
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
EOF

# Configure network interface
sudo tee -a /etc/dhcpcd.conf > /dev/null << EOF
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
EOF

# Enable services
sudo systemctl enable ssh
sudo systemctl enable docker
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq

# Set up autostart script
sudo tee /etc/systemd/system/vikas.service > /dev/null << EOF
[Unit]
Description=Vikas Learning Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/vikas
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=pi

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable vikas.service

# Create admin script
cat > /home/pi/vikas/vikas-admin.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "🚀 Starting Vikas platform..."
        docker-compose up -d
        echo "✅ Vikas is running at http://localhost"
        ;;
    stop)
        echo "⏹️  Stopping Vikas platform..."
        docker-compose down
        ;;
    restart)
        echo "🔄 Restarting Vikas platform..."
        docker-compose restart
        ;;
    logs)
        docker-compose logs -f
        ;;
    status)
        docker-compose ps
        ;;
    update)
        echo "📥 Updating Vikas platform..."
        docker-compose pull
        docker-compose up -d
        ;;
    backup)
        echo "💾 Creating backup..."
        docker run --rm -v vikas_couchdb_data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
        ;;
    import)
        if [ -z "$2" ]; then
            echo "Usage: $0 import <channel-file.zip>"
            exit 1
        fi
        echo "📦 Importing channel: $2"
        curl -X POST -F "channel=@$2" http://localhost:3001/api/v1/import-channel
        ;;
    *)
        echo "Vikas Learning Platform Admin"
        echo "Usage: $0 {start|stop|restart|logs|status|update|backup|import}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the Vikas platform"
        echo "  stop     - Stop the Vikas platform"
        echo "  restart  - Restart the Vikas platform"
        echo "  logs     - Show platform logs"
        echo "  status   - Show service status"
        echo "  update   - Update to latest version"
        echo "  backup   - Create data backup"
        echo "  import   - Import channel zip file"
        ;;
esac
EOF

chmod +x /home/pi/vikas/vikas-admin.sh
sudo ln -sf /home/pi/vikas/vikas-admin.sh /usr/local/bin/vikas

echo ""
echo "🎉 Vikas setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Reboot your Raspberry Pi: sudo reboot"
echo "2. Connect to WiFi: 'Vikas-Learning' (password: vikas123)"
echo "3. Access Vikas at: http://192.168.4.1"
echo ""
echo "💡 Admin commands:"
echo "  vikas start    - Start the platform"
echo "  vikas stop     - Stop the platform"
echo "  vikas status   - Check status"
echo "  vikas logs     - View logs"
echo "  vikas import   - Import content"
echo ""
echo "📚 Default login: admin/admin"
echo ""