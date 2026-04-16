#!/bin/bash
set -e

# Configuration
CTFD_URL="http://localhost:8000"
JUICE_SHOP_URL="http://localhost:3000"
ADMIN_USER="admin"
ADMIN_PASS="admin1234"
ADMIN_EMAIL="admin@juice-shop.op"
CTF_NAME="Juice Shop CTF"

echo "Waiting for CTFd to be ready..."
until $(curl --output /dev/null --silent --head --fail $CTFD_URL); do
    printf '.'
    sleep 5
done
echo "CTFd is up!"

# 1. Get CSRF token for setup
echo "Fetching setup page for CSRF token..."
COOKIE_FILE=$(mktemp)
SETUP_PAGE=$(curl -s -c $COOKIE_FILE $CTFD_URL/setup)
NONCE=$(echo "$SETUP_PAGE" | grep -oP 'name="nonce" value="\K[^"]+' | head -1)

if [ -z "$NONCE" ]; then
    echo "Could not find nonce in setup page"
    exit 1
fi
echo "Found nonce: $NONCE"

# 2. Perform Setup
echo "Performing initial CTFd setup..."
curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST \
  -F "ctf_name=$CTF_NAME" \
  -F "name=$ADMIN_USER" \
  -F "email=$ADMIN_EMAIL" \
  -F "password=$ADMIN_PASS" \
  -F "user_mode=users" \
  -F "nonce=$NONCE" \
  $CTFD_URL/setup > /dev/null

echo "Setup complete."

# 3. Generate CTFd export using juice-shop-ctf-cli
echo "Generating CTFd export..."
cat <<EOF > config.yml
ctfFramework: CTFd
juiceShopUrl: $JUICE_SHOP_URL
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
EOF
node dist/bin/juice-shop-ctf.js --config config.yml --output test-export.csv
if [ ! -f test-export.csv ]; then
    echo "Export file test-export.csv not found!"
    exit 1
fi
echo "Export generated successfully."

# 4. Get CSRF token for import
echo "Fetching admin config page for CSRF token..."
IMPORT_PAGE=$(curl -s -b $COOKIE_FILE $CTFD_URL/admin/config)
IMPORT_NONCE=$(echo "$IMPORT_PAGE" | grep -oP 'name="nonce" value="\K[^"]+' | head -1)

if [ -z "$IMPORT_NONCE" ]; then
    echo "Could not find nonce in admin config page"
    # Try backup page specifically
    IMPORT_PAGE=$(curl -s -b $COOKIE_FILE $CTFD_URL/admin/config#backup)
    IMPORT_NONCE=$(echo "$IMPORT_PAGE" | grep -oP 'name="nonce" value="\K[^"]+' | head -1)
fi

if [ -z "$IMPORT_NONCE" ]; then
     echo "Still could not find nonce for import"
     exit 1
fi
echo "Found import nonce: $IMPORT_NONCE"

# 5. Import the CSV
echo "Importing challenges CSV into CTFd..."
IMPORT_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST \
  -F "file=@test-export.csv" \
  -F "type=challenges" \
  -F "nonce=$IMPORT_NONCE" \
  $CTFD_URL/admin/import/csv)

# Wait a bit for import to process
sleep 10
echo "Import response received."

# 6. Verify challenges exist
echo "Verifying challenges..."
# Try up to 3 times to account for background processing
for i in {1..3}; do
    CHALLENGES_PAGE=$(curl -s -b $COOKIE_FILE $CTFD_URL/api/v1/challenges)
    CHALLENGE_COUNT=$(echo "$CHALLENGES_PAGE" | grep -o '"id"' | wc -l)
    if [ "$CHALLENGE_COUNT" -gt 0 ]; then
        break
    fi
    echo "No challenges found yet, waiting... (attempt $i)"
    sleep 10
done

if [ "$CHALLENGE_COUNT" -gt 0 ]; then
    echo "Success! Found $CHALLENGE_COUNT challenges in CTFd."
else
    echo "Verification failed: No challenges found in CTFd."
    echo "API Response: $CHALLENGES_PAGE"
    exit 1
fi

rm $COOKIE_FILE
