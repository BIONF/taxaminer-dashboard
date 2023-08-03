#!/bin/bash
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh

if { conda env list | grep 'taxaminer-dash'; } >/dev/null 2>&1; then
    echo "Using conda environment 'taxaminer-dash'"
    conda activate taxaminer-dash
elif { conda env list | grep 'taxaminer'; } >/dev/null 2>&1; then
    echo "Environment 'taxaminer-dash' does not exists, falling back to taxaminer"
    conda activate taxaminer
else
    echo "Could not detect conda environment 'taxaminer' or 'taxaminer-dash'"
    echo "Run install.sh to setup 'taxaminer-dash'"
    exit 1
fi

# build API backend
cd ./api
pyinstaller --onefile main.py
cd ..
mkdir ./react-frontend/api_dist
cp ./api/dist/main ./react-frontend/api_dist/

cd react-frontend
yarn build