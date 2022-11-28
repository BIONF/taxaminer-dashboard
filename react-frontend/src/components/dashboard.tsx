import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';
import { Tabs, Tab } from "react-bootstrap";
import { TopBar } from './topbar';
import { DataSetSelector } from './sidebar/DataSet/dataset_selector';
import SelectionView from './sidebar/selection';
import { DataSetMeta } from './sidebar/DataSet/dataset_metadata';
import Scatter3D from './scatterplot3d';
import PCAPlot from './sidebar/PCAPlot/PCAPlot';
import { FilterUI } from './sidebar/Filters';
import Table from './sidebar/DiamondTable/diamondtable';
import { TableView } from './tableview';
import ScatterMatrix from './sidebar/ScatterMatrix';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';

interface Option {
    label: string
    value: string
}

interface Props {
    base_url: string
}
  
interface State {
    dataset_id: number
    contigs: Option[]
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
    customFields: any[]
    scatterPoints: any[]
    fields: any[]
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
            filters: {e_value: 1.0, show_unassinged: true, g_searched: [], c_searched: []},
            g_options: [],
            contigs: [],
            customFields: [],
            scatterPoints: [],
            fields: []
        }

        // Bind functions passing data from child objects to local context
        this.handleDataClick = this.handleDataClick.bind(this);
	}

    /**
     * Update dataset ID and reload data
     * @param id dataset ID
     */
    setDataset(id: number) {
        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/scatterplot?id=${this.state.dataset_id}`;
            fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const main_data = {}
			    this.setState( {scatterPoints: data}, () => {
                    for (const chunk of data) {
                        for (const row of chunk) {
                            const key = row.g_name as string
                            // @ts-ignore
                            main_data[key] = row
                        }
                    }
                    this.setState({data: main_data})

                    // Infer fields from first row
                    if (main_data) {
                        // @ts-ignore
                        const proto_row = main_data[Object.keys(main_data)[0]]
                        this.setState( { fields: Object.keys(proto_row) })
                    }

                    const gene_options: { label: string; value: string; }[] = []
                    Object.keys(main_data).map((item: string) => (
                        gene_options.push( { "label": item, "value": item } )
                    ))

                    /**
                    * Extract unique contig identifiers
                    */
                    let contigs = new Set()
                    for (const key of Object.keys(main_data)) {
                        // @ts-ignore
                        const item = main_data[key]
                        contigs.add(item['c_name'])
                    }
                    // convert set to list
                    const contig_options: Option[] = []
                    contigs.forEach((each: any) => contig_options.push({ "label": each, "value": each }))

                    this.setState({contigs: contig_options})
                    this.setState({g_options: gene_options})
                    this.setState({filters: {e_value: 1.0, show_unassinged: true, g_searched: []}})
                });
            }
        )
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
     * Store custom fields of selection view globally
     * @param values 
     */
    setCustomFields = (values: any) => {
        this.setState({customFields: values})
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
                    scatterPoints={this.state.scatterPoints}
                    base_url={this.props.base_url}
                    dataset_id={this.state.dataset_id}
                    sendClick={this.handleDataClick}
                    sendCameraData={this.callbackFunction}
                    e_value={this.state.filters.e_value}
                    show_unassigned={this.state.filters.show_unassinged}
                    g_searched={this.state.filters.g_searched}
                    c_searched={this.state.filters.c_searched}
                    passScatterData={this.shareScatterData}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetSelector
                            base_url={this.props.base_url}
                            current_id={this.state.dataset_id}
                            dataset_changed={this.updateDatasetID}/>
                            <SelectionView
                            base_url={this.props.base_url}
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}
                            passCustomFields={this.setCustomFields}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI
                            g_options={this.state.g_options}
                            sendValuesUp={this.setFilters}
                            contig_options={this.state.contigs}/>
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
                                scatterPoints={this.state.scatterPoints}
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
                row={this.state.selected_row}
                customFields={this.state.customFields}
                />
        </Container>
        );
    } 
}

export { TaxaminerDashboard }