import React from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'

interface State {
    datasets: any
}

interface Props {
    dataset_changed: Function
    base_url: string
}

// Allows the user to select a dataset
class DataSetSelector extends React.Component<Props, State> {
    constructor(props: any){
        super(props)
        this.state = {  
            datasets: [{id: -1, title: "Loading...",  text: "A sample dataset to test on small scale"}]
        }
        
    }

    /**
     * Load Inital datasets
     */
    componentDidMount() {
        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/datasets`;      
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {datasets: data} );
			})
    }


    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Selection</Card.Title>
                    <Form.Select onChange={(e: any) => this.props.dataset_changed(parseInt(e.target.value))}>
                    {this.state.datasets && this.state.datasets.map((e: any, key: any) => {
                        return <option key={key} value={e.id}>{e.title}</option>;
                    })}
                    </Form.Select>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetSelector }