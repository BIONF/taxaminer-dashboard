import React from "react";
import { Button, InputGroup } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'

interface State {
    datasets: any
    new_id: number
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
            datasets: [{id: -1, title: "Select a dataset to get started",  text: "A sample dataset to test on small scale"}],
            new_id: -1
        }
        
    }

    /**
     * Load Inital datasets
     */
    componentDidMount() {
        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/datasets`;
        const default_values = [{id: -1, title: "Select a dataset",  text: "A sample dataset to test on small scale"}]
		fetch(endpoint)
			.then(response => response.json())
			.then(data => {
				this.setState( {datasets: default_values.concat(data)}, () => {
                    this.setState({new_id: -1})
                } );
			})
    }


    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Selection</Card.Title>
                    <InputGroup>
                        <Form.Select 
                        onChange={(e: any) => this.setState({new_id: parseInt(e.target.value)})}
                        defaultValue={undefined}>
                        {this.state.datasets && this.state.datasets.map((e: any, key: any) => {
                            return <option key={key} value={e.id}>{e.title}</option>;
                        })}
                        </Form.Select>
                        <Button 
                        type="submit" 
                        onClick={(e:any) => this.props.dataset_changed(this.state.new_id)}
                        disabled={(this.state.new_id === -1)}
                        >Load dataset</Button>
                    </InputGroup>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetSelector }