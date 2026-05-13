#!/bin/bash
#SBATCH --job-name=generate_weather_graph
#SBATCH --output=/mnt/shared/code/MQTT_Job_Distributor/src/shared/outputs/generate_weather_graph_output_%j.txt
#SBATCH --ntasks=1
#SBATCH --time=00:10:00

# Capture the JSON string argument
JSON_STRING=$1

# Pass the JSON string to Node.js script
node /mnt/shared/code/MQTT_Job_Distributor/src/shared/scripts/generateWeatherGraph.js "$JSON_STRING"