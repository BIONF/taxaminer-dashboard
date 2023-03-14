#!/bin/bash
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh

# parse flags
while getopts 'd' flag; do
    case "${flag}" in
        d) dev='true';;
        ?)
        echo "script usage: $(basename \$0) [-d]" >&2
        exit 1
        ;;
    esac
done

echo "######### taXaminer dashboard #########"
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

if [[ -v dev ]]; then
    echo "Running in dev mode"
    npm start --prefix ./react-frontend & cd ./api && python3 main.py
else
    echo "Running in production mode"
    cd ./react-frontend && npx serve -s build & cd ./api && python3 main.py
fi