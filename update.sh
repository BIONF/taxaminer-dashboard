#!/bin/bash
echo "Removing old conda env"
source ~/anaconda3/etc/profile.d/conda.sh
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