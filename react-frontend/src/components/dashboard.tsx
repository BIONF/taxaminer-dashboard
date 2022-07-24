import React, { createContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';
import { Tabs, Tab } from "react-bootstrap";
import { TopBar } from './topbar';
import { DataSetSelector } from './sidebar/dataset_selector';
import SelectionView from './sidebar/selection/selection';
import { DataSetMeta } from './sidebar/dataset_metadata';
import Scatter3D from './scatterplot3d/scatter3d';
import PCAPlot from './sidebar/PCAPlot/PCAPlot';
import { FilterUI } from './sidebar/filterui';
import Table from './sidebar/DiamondTable/diamondtable';
import { TableView } from './tableview/TableView';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {
}
  
interface State {
    selected_row: any
    aa_seq: string
    camera: any
    select_mode: string
    selected_data: Set<string>
    data: any
}
  

class Dashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);
		this.state ={ 
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: undefined
        }
        this.handleDataClick = this.handleDataClick.bind(this);
	}

    /**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		const endpoint = "http://127.0.0.1:5000/api/v1/data/main?id=1";
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

        if(this.state.select_mode == 'add') {
            this.state.selected_data.add(key)
        } else if(this.state.select_mode == 'remove') {
            this.state.selected_data.delete(key)
        }

        const endpoint = "http://127.0.0.1:5000/api/v1/data/seq?fasta_id=" + key;
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {aa_seq: data} )
			})
    }

    callbackFunction = (childData: any) => {
        this.setState({camera: childData})
    }
    
    setSelectMode = (new_mode: string) =>  {
        this.setState({select_mode: new_mode})
    }

    render() {
        return (
            <Container fluid>
                <Row><TopBar/></Row>
                <Row>
                <Col xs={7}>
                    <Scatter3D
                    sendClick={this.handleDataClick}
                    sendCameraData={this.callbackFunction}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetSelector/>
                            <DataSetMeta/>
                            <SelectionView 
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI/>
                        </Tab>
                        <Tab eventKey="diamon" title="Diamond Output">
                            <Row>
                                <Col>
                                <Table
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}
                           />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="PCA" title="PCA">
                            <Row>
                                <Col>
                                <PCAPlot
                                    camera = {this.state.camera}/>
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