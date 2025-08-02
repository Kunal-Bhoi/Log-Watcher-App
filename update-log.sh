#!/bin/bash

echo "Starting log updater..."
echo "Press Ctrl+C to stop"

while true; do
    # Get current date and time
    current_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Append to log file
    echo "$current_time - Log entry added" >> log.txt
    
    echo "Added: $current_time - Log entry added"
    
    # Sleep for 2 seconds
    sleep 2
done 