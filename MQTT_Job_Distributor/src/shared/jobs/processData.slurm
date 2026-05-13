#!/bin/bash
#SBATCH --job-name=process_data
#SBATCH --output=/mnt/shared/code/MQTT_Job_Distributor/src/shared/outputs/process_data_output_%j.txt
#SBATCH --ntasks=1
#SBATCH --time=00:05:00

# Capture the JSON string argument
JSON_STRING=$1

# Pass the JSON string to Node.js script
node /mnt/shared/code/MQTT_Job_Distributor/src/shared/scripts/processData.js "$JSON_STRING"