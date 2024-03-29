#!/bin/bash
CONDA=$(conda info --base)
echo "Your conda path is $CONDA"
source $CONDA/etc/profile.d/conda.sh
# setup new conda env
conda create -n taxaminer-dash -y
conda activate taxaminer-dash

# setup python
conda install python=3.8 pip -y
pip install flask flask-cors

# setup node
conda install -c conda-forge nodejs=18.14.0 -y
cd react-frontend
conda install -c conda-forge yarn
yarn install
yarn build

# setup directories
cd ..
mkdir ./api/datasets
chmod +x start.sh
