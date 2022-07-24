import React, { createContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectionModeSelector from './Components/SelectionModeSelector';
import SelectionTable from './Components/SelectionTable';
import ColumnSelector from './Components/ColumnSelector'

interface Props {
    data: []
    keys: Set<string>
    setSelectMode: any
    passClick: any
}
  
interface State {
    selected_row: any
    aa_seq: string
    camera: any
    select_mode: string
    selected_data: Set<string>
    data: any
}
  

class TableView extends React.Component<Props, State> {
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

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col xs={7}>
                        <SelectionTable
                        master_data={this.props.data}
                        keys={this.props.keys}
                        // pass table click events up
                        passClick={this.props.passClick}
                        />
                    </Col>
                    <Col>
                        <Row>
                            
                        </Row>
                        <Row>
                            <SelectionModeSelector
                            passMode = {this.props.setSelectMode}/>
                        </Row>
                        <Row>
                            <ColumnSelector/>
                        </Row>
                    </Col>
                </Row>
        </Container>
        );
    } 
}

export { TableView }