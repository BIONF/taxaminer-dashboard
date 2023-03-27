import React from "react";
import { Accordion } from "react-bootstrap";
import { fetchMetaData } from "../../../api";

import "./style.css";

interface Props {
    dataset_id: number
    base_url: string
}

interface State {
    metadata: string
}

/**
 * Component displaying assembly & analysis metadata
 */
class DataSetMeta extends React.Component<Props, State> {
    constructor(props: any){
		super(props);
		this.state ={
            metadata: "Loading..."
        }
	}

    /**
     * Init
     */
    componentDidMount() {
        this.fetchMetaData()
    }

    /**
     * Update data if dataset has changed
     * @param prev previous state
     */
    componentDidUpdate(prev: any) {
		if (prev.dataset_id !== this.props.dataset_id && this.props.dataset_id !== -1) {
			this.fetchMetaData()
		}
	}

    /**
     * Fetch meta data from API
     */
    fetchMetaData() {
        if (this.props.dataset_id !== -1) {
            fetchMetaData(this.props.base_url, this.props.dataset_id)
			.then((response: any) => response.text())
			.then(data => {
				this.setState( {metadata: data} )
            })
        }
    }

    render() {
        return (
            <Accordion className="m-2">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Metadata</Accordion.Header>
                        <Accordion.Body>
                            <div>{this.state.metadata}</div>
                        </Accordion.Body>
                </Accordion.Item> 
            </Accordion>
    )} 
}

export { DataSetMeta }