# taXaminer Dashboard
<p align="center">
<img src="https://img.shields.io/github/license/BIONF/taxaminer-dashboard" alt="License">
<img src="https://img.shields.io/github/v/release/BIONF/taxaminer-dashboard" alt="Latest Release">
<img src="https://img.shields.io/badge/Run%20with-Docker-blue?logo=docker">
<img src="https://img.shields.io/badge/run%20with-conda-3EB049?labelColor=000000&logo=anaconda">

</p>

The program contained in this repository provides a interactive representation of the output of [taXaminer](https://github.com/BIONF/taXaminer).

# Running the dashboard
Installation is possible through [conda](conda.io) or Docker. Both installation methods will download dependencies for front- and backend and build locally. Docker containers are not available on registries (yet).
## Build and run with docker locally
We provide a `docker-compose.yml`, which builds the frontend and backend containers separately and exposes the required ports. Make sure you have `docker` and `docker-compose` installed. First, clone the repository:
```bash
git clone https://github.com/BIONF/taxaminer-dashboard.git
```
then build and run the containers
```bash
docker compose up
```
The dashboard is now available locally on [http://localhost:3000](http://localhost:3000).
Press Ctrl+C in the terminal window to stop the containers. Data imported through the web frontend is stored in the filesystem of the `taxaminer-dashboard_data` volume. Please note that deleting the volume will also remove the imported data.

## Install using conda
First, clone the repository:
```bash
git clone https://github.com/BIONF/taxaminer-dashboard.git
```
We provide an installer script for all dependencies:
```bash
chmod +x install.sh
bash install.sh
```
If you have already set up a taxaminer conda env, you may use `add_to_taxaminer.sh` to add the required packages to you taXaminer env. Please note that this uses the default name from taXaminer's installer script. To start the dashboard, simply run `start.sh`. Press Ctrl+C to exit.

# Adding data
## Using the import assistant
Next to the dataset selector in the top right corner you'll find an "import" button. Clicking on it will open a dialogue asking you to choose a custom name for your new dataset, select a .zip / .tar.gz file to import and decide whether you want to keep the original .zip after import or discard it. There are several conditions to be met here:

1. The name chosen for you new dataset must be unique and cannot be empty (=> there is no subdirectoy of /datasets with this name)
2. The selected .zip file must contain the following output files:
   * contribution_of_variables.csv
   * gene_table_taxon_assignment.csv
   * proteins.faa
   * summary.txt
   * taxonomic_hits.txt

Alternatively you may enter a path to a taXaminer output directory into the designated textbox. The dashboard will validate the existence of all relevant files and will allow you to add the datasets accordingly. When using docker to run the dashboard, you may have to edit the `docker-compose.yml` file to mount the relevant directories.

## Manually create data directories
To add a dataset, create a new subdirectoy with a name of your choice in the "datasets" directory. Each folder should include the follow files from the taXaminer output directory:
* gene_table_taxon_assignment.csv
* pca_loadings.csv
* proteins.faa
* summary.txt
* taxonomic_hits.txt

## Switching datasets
The drowdown selector "Dataset Selection" at the top right will allow you to switch between datasets contained in subfolder of "datasets".

# Compatibility

## taXaminer datasets
This version of the taXaminer-dashboard incorporates the changes v0.7.1 of taXaminer (https://github.com/BIONF/taXaminer/releases/tag/v0.7.1). If any problems arise please open a new issue using the label [compatibitlity](https://github.com/BIONF/taxaminer-dashboard/labels/compatibility).

## Browser compatibility
This tool is developed and tested on the following browsers:
* Firefox 105.0.3
+ Chrome 106.0.5249.119
 

# LICENSE
This software is released under MIT license.
