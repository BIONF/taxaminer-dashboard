import React from 'react';
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

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {
}
  
interface State {
    selected_row: any
    aa_seq: string
    camera: any
}
  

class Dashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);
		this.state ={ 
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
        }
        this.handleTextChange = this.handleTextChange.bind(this);
	}

    handleTextChange(newRow: any, new_seq: string) {
        this.setState({selected_row: newRow});
        this.setState({aa_seq: new_seq})
    }

    callbackFunction = (childData: any) => {
        this.setState({camera: childData})
    }

    render() {
        return (
            <Container fluid>
                <Row><TopBar/></Row>
                <Row>
                <Col xs={7}>
                    <Scatter3D
                    handleTextChange={this.handleTextChange}
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
        </Container>
        );
    } 
}

export { Dashboard }