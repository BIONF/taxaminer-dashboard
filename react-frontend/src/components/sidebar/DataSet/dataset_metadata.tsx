import React from "react";
import Card from 'react-bootstrap/Card';
import { Accordion } from "react-bootstrap";

import "./style.css";

interface Props {
    dataset_id: number
    base_url: string
}

interface State {
    metadata: string
}

/**
 * Properly format text from \n newlines
 * @param props Component props
 * @returns list of <p></p> to insert into html
 */
function NewlineText(props: any) {
    const text = props.text;
    return text.split('\n').map((str: any) => <p>{str}</p>);
}

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
		if (prev.dataset_id != this.props.dataset_id && this.props.dataset_id !== -1) {
			this.fetchMetaData()
		}
	}

    /**
     * Fetch meta data from API
     */
    fetchMetaData() {
        if (this.props.dataset_id !== -1) {
            const endpoint = `http://${this.props.base_url}:5500/api/v1/data/summary?id=${this.props.dataset_id}`;
		        fetch(endpoint)
			    .then(response => response.text())
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