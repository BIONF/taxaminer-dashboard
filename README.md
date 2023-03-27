# taXaminer Dashboard
`v1.0.0`

The program contained in this repository provides a interactive representation of the output of [taXaminer](https://github.com/BIONF/taXaminer).

# Installation
## Download
`git clone https://github.com/BIONF/taxaminer-dashboard.git`

**Please note:** The dashboard is being developed parallel to taXaminer. Refer to section [Compatibility](##compatibility) to check if your output files are compatible.

# Installation
The dashboard is optimized for Linux / Unix operation system and MacOS. Bash scripts are provided for the installation and execution. Manual installation on Windows is possible but, if possible, consider installing the dashboard on the Windows subsystem for Linux (WSL) instead.

This tool requires [conda](conda.io) to install dependencies. Simply make `install.sh` executable (`chmod +x install.sh`) and run it `./install.sh`.

If you have already set up a taxaminer conda env, you may use `add_to_taxaminer.sh` to add the required packages to you taXaminer env. Please note that this uses the default name from taXaminer's installer script.

# Usage
## Adding Datasets
### Using the import assistant
Next to the dataset selector in the top right corner you'll find an "import" button. Clicking on it will open a dialogue asking you to choose a custom name for your new dataset, select a .zip / .tar.gz file to import and decide whether you want to keep the original .zip after import or discard it. There are several conditions to be met here:

1. The name chosen for you new dataset must be unique and cannot be empty (=> there is no subdirectoy of /datasets with this name)
2. The selected .zip file must contain the taXaminer output directory at top level (=> you should see paths like foo.zip > proteins.faa)

Alternatively you may enter a path to a taXaminer output directory into the designated textbox. The dashboard will validate the existence of all relevant files and will allow you to add the datasets accordingly.

### Adding data manually

To add a dataset, create a new subdirectoy with a name of your choice in the "datasets" directory. Each folder should include the follow files from the taXaminer output directory:
* gene_table_taxon_assignment.csv
* pca_loadings.csv
* proteins.faa
* summary.txt
* taxonomic_hits.txt

## Starting the application
The dashboard requires both a Node.js and python process to be running in the background. `start.sh` will auto-detect you conda installation options (see above) and launch the processes. Do not close the terminal the processes are running in. Please wait until you the terminal provides an output similar to this:
```
   ┌────────────────────────────────────────────┐
   │                                            │
   │   Serving!                                 │
   │                                            │
   │   - Local:    http://localhost:3000        │
   │   - Network:  http://172.21.157.104:3000   │
   │                                            │
   │   Copied local address to clipboard!       │
   │                                            │
   └────────────────────────────────────────────┘
```
Then use one of the available links to open the dashboard in you browser. If you're running the dashboard on a remote system the "Local" address **will not** work. Depending one the size of your dataset it might take a few seconds to load all data.

## Switching datasets
The drowdown selector "Dataset Selection" at the top right will allow you to switch between datasets contained in subfolder of "datasets".

## Stopping the application
You may use `Ctrl+C` in your original terminal to kill both processes and shutdown the application.

# Compatibility

## taXaminer datasets
This version of the taXaminer-dashboard incorporates the changes v0.07.0 of taXaminer (https://github.com/BIONF/taXaminer/releases/tag/v0.7.1). If any problems arise please open a new issue using the label [compatibitlity](https://github.com/BIONF/taxaminer-dashboard/labels/compatibility).

## Browser compatibility
This tool is developed and tested on the following browsers:
* Firefox 105.0.3
+ Chrome 106.0.5249.119
 

# LICENSE
This software is released under MIT license.