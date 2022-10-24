import React from "react";
import { Button, InputGroup } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import UploadDialogue from "./UploadDialogue";

interface State {
    datasets: any
    new_id: number
    show_import_modal: boolean
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
            new_id: -1,
            show_import_modal: false
        }
        
    }

    /**
     * Load Inital datasets
     */
    componentDidMount() {
        this.updateIndex()
    }

    /**
     * Receive signal from child that import form has finished
     */
    hideModalCallback = () => {
        if (this.state.show_import_modal) {
            this.setState({ show_import_modal: false })
            this.updateIndex()
        }
    }

    showModal = () => {
        this.setState({ show_import_modal: true })
    }

    /**
     * Update indexed available datasets
     */
    updateIndex() {
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
            <>
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
                        ><span className='bi bi-arrow-right-circle m-2'/>Load</Button>
                        <Button onClick={this.showModal} variant="success">
                            <span className='bi bi-upload m-2'/>Upload new
                        </Button>
                    </InputGroup>
                </Card.Body>
            </Card>
           
                <UploadDialogue
                base_url={this.props.base_url}
                show_modal={this.state.show_import_modal}
                hide_modal_callback={this.hideModalCallback}
                invalid_names={this.state.datasets.map((each: any) => {
                    return each.title;
                })}
                />

            
            </>
        );
    } 
}

export { DataSetSelector }