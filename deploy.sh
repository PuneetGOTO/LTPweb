#!/bin/bash
#=============================================================================
#  LTP Service Platform — Ubuntu Production Deployment Script
#  ------------------------------------------------------------
#  This script automates the FULL deployment of the LTP Next.js application
#  on a fresh Ubuntu 22.04/24.04 server including:
#    • System update & essential packages
#    • Node.js 22 LTS (via NodeSource)
#    • PostgreSQL 16 database setup
#    • Application build & Prisma migration
#    • PM2 process manager (auto-restart on crash/reboot)
#    • Nginx reverse proxy
#    • Let's Encrypt SSL (via Certbot)
#    • UFW firewall configuration
#
#  Usage:
#    1. Upload your project to the server (git clone or scp)
#    2. cd into the project root
#    3. chmod +x deploy.sh
#    4. sudo ./deploy.sh
#
#  You will be prompted for:
#    - Your domain name (e.g. ltp.example.com)
#    - Your email (for Let's Encrypt)
#    - PostgreSQL password
#    - Cloudinary credentials
#=============================================================================

set -e  # Exit on any error

# ============ Colors for output ============
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[LTP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

# ============ Pre-flight check ============
if [ "$EUID" -ne 0 ]; then
  err "This script must be run as root. Use: sudo ./deploy.sh"
  exit 1
fi

# ============ Gather user inputs ============
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║       LTP SERVICE PLATFORM — DEPLOYMENT WIZARD       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

read -p "🌐 Enter your domain name (e.g. ltp.example.com): " DOMAIN
read -p "📧 Enter your email (for Let's Encrypt SSL): " EMAIL
read -sp "🔑 Set a PostgreSQL password for 'ltpuser': " DB_PASSWORD
echo ""
read -p "☁️  Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "☁️  Cloudinary API Key: " CLOUDINARY_API_KEY
read -sp "☁️  Cloudinary API Secret: " CLOUDINARY_API_SECRET
echo ""

# Derived values
APP_DIR=$(pwd)
APP_USER=${SUDO_USER:-$(whoami)}
DB_NAME="ltp"
DB_USER="ltpuser"
AUTH_SECRET=$(openssl rand -hex 32)
PORT=3000

log "Domain:    $DOMAIN"
log "App Dir:   $APP_DIR"
log "App User:  $APP_USER"
log "DB Name:   $DB_NAME"

echo ""
read -p "⚡ Proceed with deployment? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

# ================================================================
# STEP 1: System Update & Essential Packages
# ================================================================
log "Step 1/9 — Updating system & installing essentials..."

apt-get update -y && apt-get upgrade -y
apt-get install -y \
  curl wget git build-essential software-properties-common \
  ca-certificates gnupg lsb-release ufw

# ================================================================
# STEP 2: Install Node.js 22 LTS
# ================================================================
log "Step 2/9 — Installing Node.js 22 LTS..."

if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

log "Node.js version: $(node -v)"
log "npm version: $(npm -v)"

# Install PM2 globally
npm install -g pm2

# ================================================================
# STEP 3: Install & Configure PostgreSQL 16
# ================================================================
log "Step 3/9 — Installing PostgreSQL..."

if ! command -v psql &> /dev/null; then
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
  apt-get update -y
  apt-get install -y postgresql-16
fi

systemctl enable postgresql
systemctl start postgresql

# Create database and user
log "Configuring PostgreSQL database..."
sudo -u postgres psql -c "DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;"

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
log "Database ready: ${DB_NAME}"

# ================================================================
# STEP 4: Create .env Production File
# ================================================================
log "Step 4/9 — Creating production .env file..."

cat > "${APP_DIR}/.env" << EOF
# === Database ===
DATABASE_URL="${DATABASE_URL}"

# === NextAuth ===
AUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="https://${DOMAIN}"
AUTH_TRUST_HOST=true

# === Cloudinary ===
CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}"
CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}"
EOF

chown ${APP_USER}:${APP_USER} "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"
log ".env created with secure permissions (600)"

# ================================================================
# STEP 5: Install Dependencies & Build Application
# ================================================================
log "Step 5/9 — Installing dependencies & building..."

cd "${APP_DIR}"

# Run as the app user, not root
sudo -u ${APP_USER} npm ci --production=false

# Generate Prisma client
sudo -u ${APP_USER} npx prisma generate

# Push database schema
sudo -u ${APP_USER} npx prisma db push --accept-data-loss

# Build Next.js production bundle
sudo -u ${APP_USER} npm run build

log "Build completed successfully!"

# ================================================================
# STEP 6: Setup PM2 Process Manager
# ================================================================
log "Step 6/9 — Configuring PM2..."

# Create PM2 ecosystem config
cat > "${APP_DIR}/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [{
    name: 'ltp-web',
    script: 'node_modules/.bin/next',
    args: 'start -p ${PORT}',
    cwd: '${APP_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    }
  }]
}
EOF

chown ${APP_USER}:${APP_USER} "${APP_DIR}/ecosystem.config.cjs"

# Stop existing instance if running
pm2 delete ltp-web 2>/dev/null || true

# Start with PM2
sudo -u ${APP_USER} pm2 start "${APP_DIR}/ecosystem.config.cjs"
sudo -u ${APP_USER} pm2 save

# Setup PM2 startup on boot
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
sudo -u ${APP_USER} pm2 save

log "PM2 configured — app running on port ${PORT}"

# ================================================================
# STEP 7: Install & Configure Nginx
# ================================================================
log "Step 7/9 — Setting up Nginx reverse proxy..."

apt-get install -y nginx
systemctl enable nginx

# Create Nginx config
cat > /etc/nginx/sites-available/ltp << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Redirect all HTTP to HTTPS (will be handled by Certbot)
    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;

        # Next.js specific
        proxy_buffering off;
    }

    # Static assets with long cache
    location /_next/static {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    client_max_body_size 50M;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/ltp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
log "Nginx configured for ${DOMAIN}"

# ================================================================
# STEP 8: Let's Encrypt SSL Certificate
# ================================================================
log "Step 8/9 — Installing Let's Encrypt SSL..."

apt-get install -y certbot python3-certbot-nginx

# Obtain SSL cert (will auto-configure Nginx for HTTPS + redirect)
certbot --nginx \
  -d "${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --email "${EMAIL}" \
  --redirect

# Auto-renew cron (certbot usually sets this up, but just in case)
systemctl enable certbot.timer 2>/dev/null || \
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

log "SSL certificate installed for ${DOMAIN}"

# ================================================================
# STEP 9: Firewall Configuration
# ================================================================
log "Step 9/9 — Configuring UFW firewall..."

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

log "Firewall configured (SSH + HTTP/HTTPS only)"

# ================================================================
# DONE!
# ================================================================
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         🎉 DEPLOYMENT COMPLETE! 🎉                  ║${NC}"
echo -e "${CYAN}╠═══════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}                                                       ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  🌐 URL:      ${GREEN}https://${DOMAIN}${NC}                "
echo -e "${CYAN}║${NC}  📦 App Dir:  ${APP_DIR}                               "
echo -e "${CYAN}║${NC}  🗄️  Database: ${DB_NAME} (user: ${DB_USER})            "
echo -e "${CYAN}║${NC}  🔧 PM2:      pm2 status / pm2 logs ltp-web           "
echo -e "${CYAN}║${NC}  🔒 SSL:      Let's Encrypt (auto-renew)              "
echo -e "${CYAN}║${NC}                                                       ${CYAN}║${NC}"
echo -e "${CYAN}╠═══════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  ${YELLOW}Useful Commands:${NC}                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    pm2 restart ltp-web     — Restart app              ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    pm2 logs ltp-web        — View logs                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    pm2 monit               — Live monitoring          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    sudo nginx -t           — Test Nginx config        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    sudo certbot renew      — Renew SSL                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}    npx prisma studio       — DB visual editor         ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                       ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
