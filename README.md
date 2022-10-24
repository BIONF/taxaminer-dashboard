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
### Using the import assistant
Next to the dataset selector in the top right corner you'll find an "import" button. Clicking on it will open a dialogue asking you to choose a custom name for your new dataset, select a .zip file to import and decide whether you want to keep the original .zip after import or discard it. There are several conditions to be met here:

1. The name chosen for you new dataset must be unique and cannot be empty (=> there is no subdirectoy of /datasets with this name)
2. The selected .zip file must contain the taXaminer output directory at top level (=> you should see paths like foo.zip > proteins.faa)

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
Compiled successfully!

You can now view react-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://172.17.102.12:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
No issues found.
```
Then use one of the available links to open the dashboard in you browser. If you're running the dashboard on a remote system the "Local" address **will not** work. Depending one the size of your dataset I might take a few seconds to load all data.

## Switching datasets
The drowdown selector "Dataset Selection" at the top right will allow you to switch between datasets contained in subfolder of "datasets".

## Stoppign the application
You may use `Ctrl+C` in your original terminal to kill both processes and shutdown the application.

# Compatibility

## taXaminer datasets
The current version incorporates the changes of commit [a424195](https://github.com/BIONF/taXaminer/commit/a424195509a2bc425ed7012c26ce056b565e7254). If any problems arise please open a new issue using the label [(taXaminer compatibility)](https://github.com/BIONF/taXaminer-dashboard/labels/taXanimer%20compatibility).

## Browser compatibility
This tool is developed and tested on the following browsers:
* Firefox 105.0.3
+ Chrome 106.0.5249.119
 

# LICENSE
This software is released under [MIT license](https://github.com/BIONF/taXaminer-dashboard/blob/prototyping/LICENSE).