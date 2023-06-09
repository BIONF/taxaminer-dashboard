import React from "react";
import { Button, InputGroup, Spinner, Tab, Tabs } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { DataSetMeta } from "./dataset_metadata";
import UploadDialogue from "./UploadDialogue";
import { listDatasets, removeDataset } from "../../../api";

interface State {
    datasets: {id: number, title: string, text: string}[]
    new_id: number
    show_import_modal: boolean
    show_remove: boolean
}

interface Props {
    dataset_changed: (id: number) => void
    base_url: string
    current_id: number
    is_loading: boolean
}

// Allows the user to select a dataset
class DataSetSelector extends React.Component<Props, State> {
    constructor(props: Props){
        super(props)
        this.state = {  
            datasets: [{id: -1, title: "Select a dataset to get started",  text: "A sample dataset to test on small scale"}],
            new_id: -1,
            show_import_modal: false,
            show_remove: false
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
    hideModalCallback = async (title: string) => {
        if (this.state.show_import_modal) {
            this.setState({ show_import_modal: false })
            // update datasets
            const datasets = await this.updateIndex()
            if (title !== "") {
                for (let i=0; i < datasets.length; i++) {
                    if (datasets[i].title === "/" + title) {
                        this.setState({new_id: -1})
                        this.props.dataset_changed(i)
                        break
                    }
                }
            }
        }
    }

    /**
     * Show the import modal
     */
    showModal = () => {
        this.setState({ show_import_modal: true })
    }

    /**
     * Toggle remove dataset dialogue
     */
    showRemoveModal = (show: boolean) => {
        this.setState({ show_remove: show })
    }

    /**
     * Remove the currently selected dataset
     */
    removeDataset = () => {
        removeDataset(this.props.base_url, this.state.new_id)
        .then(() => {
            this.updateIndex()
            this.setState({new_id: -1})
            this.props.dataset_changed(-1)
            this.setState({show_remove: false})
        })
    }

    /**
     * Update indexed available datasets
     */
    async updateIndex() {
        const datasets = await listDatasets(this.props.base_url)
        this.setState({datasets: datasets}, () => {
            this.setState({new_id: -1})
        });
        return datasets
    }

    render() {
        return (
            <>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Selection</Card.Title>
                        <Tabs>
                            <Tab title="Dataset selection" eventKey="selection-tab">
                                <InputGroup className="m-2">
                                    <Form.Select 
                                    onChange={(e: any) => this.setState({new_id: parseInt(e.target.value)})}
                                    defaultValue={undefined}>
                                    {this.state.datasets && this.state.datasets.map((e: any, key: any) => {
                                        return <option key={key} value={e.id}>{e.title.replace("/", "")}</option>;
                                    })}
                                    </Form.Select>
                                    <Button 
                                    type="submit" 
                                    onClick={() => this.props.dataset_changed(this.state.new_id)}
                                    disabled={(this.state.new_id === -1)}>
                                        {
                                            this.props.is_loading && <Spinner className="mr-2" as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                        }
                                        {
                                            !this.props.is_loading && <span className='bi bi-arrow-right-circle m-2'/>
                                        }
                                        Load
                                    </Button>
                                    <Button onClick={this.showModal} variant="success">
                                        <span className='bi bi-upload m-2'/>Add new
                                    </Button>
                                    <Button onClick={() => this.showRemoveModal(true)} variant="danger" disabled={(this.state.new_id === -1)}>
                                        <span className='bi bi-trash m-2'/>Remove
                                    </Button>
                                    <Modal show={this.state.show_remove}>
                                        <Modal.Header>
                                            <Modal.Title><span className='bi bi-trash m-2'/> Confirm delete</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            Remove dataset {this.state.new_id !== -1 &&this.state.datasets[Math.abs(this.state.new_id)].title.replace("/", "")}?
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button onClick={() => this.showRemoveModal(false)}><span className='bi bi-x-circle m-2'/>Cancel</Button>
                                            <Button variant="danger" onClick={this.removeDataset}><span className='bi bi-trash m-2'/>Remove</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </InputGroup>
                            </Tab>
                            <Tab title="Dataset metadata" eventKey="metadata-tab">
                                <DataSetMeta
                                dataset_id={this.props.current_id}
                                base_url={this.props.base_url}
                                />
                            </Tab>
                        </Tabs>
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