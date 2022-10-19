#!/bin/bash
echo "######### taXaminer dashboard #########"
source ~/anaconda3/etc/profile.d/conda.sh
if { conda env list | grep 'taxaminer-dash'; } >/dev/null 2>&1; then
    echo "Using conda environment 'taxaminer-dash'"
    conda activate taxaminer-dash
    cd ./react-frontend && npm start ./react-frontend & cd ./api && python main.py
elif { conda env list | grep 'taxaminer'; } >/dev/null 2>&1; then
    echo "Environment 'taxaminer-dash' does not exists, falling back to taxaminer"
    conda activate taxaminer
    npm start ./react-frontend & cd ./api && python main.py
else
    echo "Could not detect conda environment 'taxaminer' or 'taxaminer-dash'"
    echo "Run install.sh to setup 'taxaminer-dash'"
fi