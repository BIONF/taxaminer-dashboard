import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';
import { Tabs, Tab } from "react-bootstrap";
import { TopBar } from './topbar';
import { DataSetSelector } from './sidebar/DataSet/dataset_selector';
import SelectionView from './sidebar/selection/selection';
import { DataSetMeta } from './sidebar/DataSet/dataset_metadata';
import Scatter3D from './scatterplot3d/scatter3d';
import PCAPlot from './sidebar/PCAPlot/PCAPlot';
import { FilterUI } from './sidebar/Filters/filterui';
import Table from './sidebar/DiamondTable/diamondtable';
import { TableView } from './tableview/TableView';
import ScatterMatrix from './sidebar/ScatterMatrix/ScatterMatrix';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {
    base_url: string
}
  
interface State {
    dataset_id: number
    selected_row: any
    aa_seq: string
    camera: any
    select_mode: string
    selected_data: Set<string>
    data: any
    e_value: any
    filters: any
    scatter_data: any
    g_options: any[]
}
  

class TaxaminerDashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);
		this.state ={
            dataset_id: -1,
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: [],
            scatter_data: { colors: "rainbow", legendonly: []},
            e_value: 1.0,
            filters: {e_value: 1.0, show_unassinged: true, g_searched: []},
            g_options: []
        }

        // Bind functions passing data from child objects to local context
        this.handleDataClick = this.handleDataClick.bind(this);
	}

    /**
     * Update dataset ID and reload data
     * @param id dataset ID
     */
    setDataset(id: number) {
        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/main?id=${id}`;
            fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                this.setState( {data: data}, () => {
                    this.setState( {dataset_id: id} )
                } );
    
                // update searchbar options
                const gene_options: { label: string; value: string; }[] = []
                Object.keys(data).map((item: string) => (
                    gene_options.push( { "label": item, "value": item } )
                ))
                this.setState({g_options: gene_options})
                this.setState({filters: {e_value: 1.0, show_unassinged: true, g_searched: []}})
            })

    }

    /**
	 * Call API on component mount to main table data
	 */
	componentDidMount() {
        this.updateDatasetID(-1)
	}

    
    /**
     * Call this everytime a click event referring to a datapoint's key in the primary table occurs
     * @param newRow new data row
     * @param new_seq 
     */
    handleDataClick(keys: string[]) {
        const new_row = this.state.data[keys[0]];
        if (new_row !== undefined) {
            this.setState({selected_row: this.state.data[keys[0]]});
        }

        if(this.state.select_mode === 'add') {
            keys.forEach(key => this.state.selected_data.add(key))
            // this.state.selected_data.concat(key)
        } else if(this.state.select_mode === 'remove') {
            keys.forEach(key => this.state.selected_data.delete(key))
            //this.state.selected_data.delete(key)
        }

        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/seq?id=${this.state.dataset_id}&fasta_id=${new_row.fasta_header}`;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {aa_seq: data} )
			})
    }

    /**
     * Pass the camera position from the main scatterplot
     * @param childData camera data (Plotly)
     */
    callbackFunction = (childData: any) => {
        this.setState({camera: childData})
    }
    
    /**
     * Set the current selection mode globally
     * @param new_mode 'add','remove' odr 'neutral'
     */
    setSelectMode = (new_mode: string) =>  {
        this.setState({select_mode: new_mode})
    }

    /**
     * Set filter values
     * @param values values passed from FilterUI components
     */
    setFilters = (values: any) => {
        this.setState({filters: values})
    }

    /**
     * Uses the scatter data from the main plot to slave the scatter matrix
     * @param values 
     */
    shareScatterData = (values: any) => {
        this.setState({scatter_data: values})
    }

    updateDatasetID = (ID: number) => {
        if (ID !== this.state.dataset_id) {
            this.setState({dataset_id: ID}, () => {
                this.setDataset(ID)
            })
        }
    }

    render() {
        return (
            <Container fluid>
                <Row><TopBar/></Row>
                <Row>
                <Col xs={7}>
                    <Scatter3D
                    base_url={this.props.base_url}
                    dataset_id={this.state.dataset_id}
                    sendClick={this.handleDataClick}
                    sendCameraData={this.callbackFunction}
                    e_value={this.state.filters.e_value}
                    show_unassigned={this.state.filters.show_unassinged}
                    g_searched={this.state.filters.g_searched}
                    passScatterData={this.shareScatterData}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetSelector
                            base_url={this.props.base_url}
                            dataset_changed={this.updateDatasetID}/>
                            <DataSetMeta
                            base_url={this.props.base_url}
                            dataset_id={this.state.dataset_id}/>
                            <SelectionView
                            base_url={this.props.base_url}
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI
                            g_options={this.state.g_options}
                            sendValuesUp={this.setFilters}/>
                        </Tab>
                        <Tab eventKey="diamodn" title="Diamond Output">
                            <Row>
                                <Col>
                                <Table
                                base_url={this.props.base_url}
                                dataset_id={this.state.dataset_id}
                                row={this.state.selected_row}
                                />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="scatter_matrix" title="Scatter Matrix">
                            <ScatterMatrix
                                base_url={this.props.base_url}
                                sendClick={this.handleDataClick}
                                e_value={this.state.filters.e_value}
                                show_unassigned={this.state.filters.show_unassinged}
                                scatter_data = {this.state.scatter_data}
                                dataset_id={this.state.dataset_id}
                                />
                        </Tab>
                        <Tab eventKey="PCA" title="PCA">
                            <Row>
                                <Col>
                                <PCAPlot
                                    base_url={this.props.base_url}
                                    camera = {this.state.camera}
                                    dataset_id = {this.state.dataset_id}/>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Col>
                </Row>
                <TableView
                base_url={this.props.base_url}
                data={this.state.data}
                keys={this.state.selected_data}
                setSelectMode={this.setSelectMode}
                passClick={this.handleDataClick}
                dataset_id={this.state.dataset_id}
                />
        </Container>
        );
    } 
}

export { TaxaminerDashboard }