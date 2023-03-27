#!/bin/bash
##########################################################################
# This script expands the default conda env. of a taXaminer installation #
# and adds necessary packages to run the dashboard locally               #
##########################################################################
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh

echo "Activating conda environment"
conda activate taxaminer

# install python packages
echo "Installing python dependencies"
pip install flask flask-cors

# setup Node.js
echo "Installing Node.js server and npm packages"
conda install nodejs -y
cd react-frontend
npm install --legacy-peer-deps
npm run build