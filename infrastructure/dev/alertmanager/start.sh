#!/bin/sh
set -eu

SOURCE=/etc/alertmanager-config/alertmanager.yml
TARGET=/tmp/alertmanager.yml

printf %s "${ALERT_WEBHOOK_TOKEN:-}" > /tmp/alert-webhook-token
printf %s "${TELEGRAM_BOT_TOKEN:-}" > /tmp/telegram-bot-token

if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  sed "s/__TELEGRAM_CHAT_ID__/${TELEGRAM_CHAT_ID}/" "$SOURCE" > "$TARGET"
else
  sed '/telegram:begin/,/telegram:end/d' "$SOURCE" > "$TARGET"
fi

exec /bin/alertmanager --config.file="$TARGET" --storage.path=/alertmanager
