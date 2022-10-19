# taXaminer Dashboard
``v1.0``

The program contained in this repository provides a interactive representation of the output of [taXaminer](https://github.com/BIONF/taXaminer).

# Installation
## Download
`git clone https://github.com/lukekoch/taxaminer-dashboard-react.git`

**Please note:** The dashboard is being developed parallel to taXaminer. Refer to section [Compatibility](##compatibility) to check if your output files are compatible.

# Installation
This tool requires conda to install dependencies. Simply make `install.sh` executable (`chmod +x install.sh`) and run it `./install.sh`.

If you have already set up a taxaminer conda env, you may use `add_to_taxaminer.sh` to add the required packages to you taXaminer env. Please not that this uses the default name from taXaminer's installer script.

# Usage
## Adding Datasets
To add a dataset, create a new subdirectoy with a name of your choice in the "datasets" directory. Each folder should include the follow files from the taXaminer output directory:
* gene_table_taxon_assignment.csv
* pca_loadings.csv
* proteins.faa
* summary.txt
* taxonomic_hits.txt

## Starting application
The dashboard requires both a Node.js and python process to be running in the background. `start.sh` will auto-detect you conda installation options (see above) and launch the processes. Do not close the terminal. You may stop the aplication by using `Ctrl+C`

# Compatibility

## taXaminer datasets
The current version incorporates the changes of commit [a424195](https://github.com/BIONF/taXaminer/commit/a424195509a2bc425ed7012c26ce056b565e7254). If any problems arise please open a new issue using the label [(taXaminer compatibility)](https://github.com/BIONF/taXaminer-dashboard/labels/taXanimer%20compatibility).

## Browser compatibility
This tool is developed and tested on the following browsers:
* Firefox 105.0.3
+ Chrome 106.0.5249.119
 

# LICENSE
This software is released under [MIT license](https://github.com/BIONF/taXaminer-dashboard/blob/prototyping/LICENSE).