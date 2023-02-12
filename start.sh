#!/bin/bash
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh
echo "######### taXaminer dashboard #########"
if { conda env list | grep 'taxaminer-dash'; } >/dev/null 2>&1; then
    echo "Using conda environment 'taxaminer-dash'"
    conda activate taxaminer-dash
    npm start --prefix ./react-frontend & cd ./api && python3 main.py
elif { conda env list | grep 'taxaminer'; } >/dev/null 2>&1; then
    echo "Environment 'taxaminer-dash' does not exists, falling back to taxaminer"
    conda activate taxaminer
    npm start --prefix ./react-frontend & cd ./api && python main.py
else
    echo "Could not detect conda environment 'taxaminer' or 'taxaminer-dash'"
    echo "Run install.sh to setup 'taxaminer-dash'"
fi