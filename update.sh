#!/bin/bash
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh
echo "Removing old conda env"
if { conda env list | grep 'taxaminer-dash'; } >/dev/null 2>&1; then
    echo "Removing 'taxaminer-dash'"
    conda env remove -n taxaminer-dash
fi

echo "Updating repository"
git fetch --all
git reset --hard

chmod +x start.sh
chmod +x install.sh

./install.sh