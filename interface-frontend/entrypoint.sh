#!/bin/sh

# Read study.config.yml and generate Vite .env file
# This script runs at container startup

CONFIG_FILE="/study.config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: study.config.yml not found at $CONFIG_FILE"
    exit 1
fi

# Parse YAML and generate .env file
# Uses simple grep/sed pattern matching for basic YAML parsing

echo "Generating .env file from study.config.yml..."

cat > /app/.env << EOF
VITE_PROXY_URL=$(grep '^backend_url:' $CONFIG_FILE | sed 's/backend_url: *//;s/"//g;s/'\''//g;s/  *#.*//;s/ *$//')
VITE_CHAT_ENABLED_BEGIN=$(grep '^chat_enabled_from_page:' $CONFIG_FILE | sed 's/chat_enabled_from_page: *//;s/  *#.*//;s/ *$//')
VITE_CHAT_ENABLED_END=$(grep '^chat_enabled_until_page:' $CONFIG_FILE | sed 's/chat_enabled_until_page: *//;s/  *#.*//;s/ *$//')
VITE_ALLOW_IMAGES=$(grep '^allow_image_attachments:' $CONFIG_FILE | sed 's/allow_image_attachments: *//;s/  *#.*//;s/ *$//')
VITE_PCTP_CONDITION=$(grep '^condition:' $CONFIG_FILE | sed 's/condition: *//;s/"//g;s/'\''//g;s/  *#.*//;s/ *$//')
VITE_ATTN_CHECK_PAGE=$(grep '^attention_check_page:' $CONFIG_FILE | sed 's/attention_check_page: *//;s/  *#.*//;s/ *$//')
VITE_ATTN_CHECK_RES=$(grep '^attention_check_answers:' $CONFIG_FILE | sed 's/attention_check_answers: *//;s/"//g;s/'\''//g;s/  *#.*//;s/ *$//')
VITE_DEV_MODE=$(grep '^dev_mode:' $CONFIG_FILE | sed 's/dev_mode: *//;s/  *#.*//;s/ *$//')
VITE_SYSTEM_PROMPT=$(grep '^system_prompt:' $CONFIG_FILE | sed 's/system_prompt: *//;s/"//g;s/'\''//g;s/  *#.*//;s/ *$//')
EOF

echo ".env file generated successfully:"
cat /app/.env

# Start Vite dev server with host 0.0.0.0 to allow external connections
echo "Starting Vite dev server..."
npm run dev -- --host 0.0.0.0
