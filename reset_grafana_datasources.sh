#!/bin/bash

# Grafana credentials
USER=admin
PASS=adminadmin
HOST=localhost
PORT=3000

# Temporary directory for exported datasources
EXPORT_DIR="./datasources"
mkdir -p "$EXPORT_DIR"

echo "Exporting datasources..."
# Export each datasource into a separate file
curl -s "http://$HOST:$PORT/api/datasources" \
  -u "$USER:$PASS" \
  | jq -c -M '.[]' \
  | split -l 1 - "$EXPORT_DIR/datasource_"

echo "Re-importing datasources..."
# Loop through each exported file and POST it back to Grafana
for datasource_file in "$EXPORT_DIR"/*; do
  echo "Importing $datasource_file..."
  curl -s --fail -X POST "http://$HOST:$PORT/api/datasources" \
    -H "Content-Type: application/json" \
    -u "$USER:$PASS" \
    --data-binary @"$datasource_file"
done

echo "Done!"
