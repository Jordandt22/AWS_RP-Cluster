#!/bin/bash
#SBATCH --job-name=sort_numbers
#SBATCH --output=/mnt/shared/code/MQTT_Job_Distributor/src/shared/outputs/sort_nums_output_%j.txt
#SBATCH --ntasks=1
#SBATCH --time=00:05:00

# Capture the JSON string argument
JSON_STRING=$1

# Pass the JSON string to Node.js script
node /mnt/shared/code/MQTT_Job_Distributor/src/shared/scripts/sortNums.js "$JSON_STRING"