#!/bin/bash

# setup new conda env
source ~/anaconda3/etc/profile.d/conda.sh
conda create -n taxaminer-dash -y
conda activate taxaminer-dash

# setup python
conda install python=3.8 pip -y
pip install flask flask-cors

# setup node
conda install nodejs -y
cd react-frontend
npm install --legacy-peer-deps