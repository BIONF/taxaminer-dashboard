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
}
  

class Dashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);
		this.state ={
            dataset_id: 1,
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: undefined,
            scatter_data: { colors: "rainbow" },
            e_value: 1.0,
            filters: {e_value: 1.0, show_unassinged: true}
        }

        // Bind functions passing data from child objects to local context
        this.setDataset = this.setDataset.bind(this);
        this.handleDataClick = this.handleDataClick.bind(this);
	}

    /**
     * Update dataset ID and reload data
     * @param id dataset ID
     */
    setDataset(id: number) {
        this.setState( {dataset_id: id} );
        const endpoint = `http://127.0.0.1:5000/api/v1/data/main?id=${id}`;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} );
			})
    }

    /**
	 * Call API on component mount to main table data
	 */
	componentDidMount() {
		const endpoint = `http://127.0.0.1:5000/api/v1/data/main?id=${this.state.dataset_id}`;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {data: data} );
			})
	}

    /**
     * Call this everytime a click event referring to a datapoint's key in the primary table occurs
     * @param newRow new data row
     * @param new_seq 
     */
    handleDataClick(key: string) {
        this.setState({selected_row: this.state.data[key]});

        if(this.state.select_mode === 'add') {
            this.state.selected_data.add(key)
        } else if(this.state.select_mode === 'remove') {
            this.state.selected_data.delete(key)
        }

        const endpoint = `http://127.0.0.1:5000/api/v1/data/seq?id=${this.state.dataset_id}&fasta_id=${key}`;
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
        console.log(values)
        this.setState({scatter_data: values})
    }

    render() {
        return (
            <Container fluid>
                <Row><TopBar/></Row>
                <Row>
                <Col xs={7}>
                    <Scatter3D
                    dataset_id={this.state.dataset_id}
                    sendClick={this.handleDataClick}
                    sendCameraData={this.callbackFunction}
                    e_value={this.state.filters.e_value}
                    show_unassigned={this.state.filters.show_unassinged}
                    passScatterData={this.shareScatterData}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetSelector
                            dataset_changed={this.setDataset}/>
                            <DataSetMeta dataset_id={this.state.dataset_id}/>
                            <SelectionView 
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI
                            sendValuesUp={this.setFilters}/>
                        </Tab>
                        <Tab eventKey="diamodn" title="Diamond Output">
                            <Row>
                                <Col>
                                <Table
                                dataset_id={this.state.dataset_id}
                                row={this.state.selected_row}
                                />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="scatter_matrix" title="Scatter Matrix">
                            <ScatterMatrix
                                sendClick={this.handleDataClick}
                                e_value={this.state.filters.e_value}
                                show_unassigned={this.state.filters.show_unassinged}
                                scatter_data = {this.state.scatter_data}
                                />
                        </Tab>
                        <Tab eventKey="PCA" title="PCA">
                            <Row>
                                <Col>
                                <PCAPlot
                                    camera = {this.state.camera}
                                    dataset_id = {this.state.dataset_id}/>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Col>
                </Row>
                <TableView
                data={this.state.data}
                keys={this.state.selected_data}
                setSelectMode={this.setSelectMode}
                passClick={this.handleDataClick}
                />
        </Container>
        );
    } 
}

export { Dashboard }