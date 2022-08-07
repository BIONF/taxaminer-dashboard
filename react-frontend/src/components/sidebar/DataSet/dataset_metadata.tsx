import React from "react";
import Card from 'react-bootstrap/Card';
import { Accordion } from "react-bootstrap";

import "./style.css";

interface Props {
    dataset_id: number
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
		if (prev.dataset_id != this.props.dataset_id) {
			this.fetchMetaData()
		}
	}

    /**
     * Fetch meta data from API
     */
    fetchMetaData() {
        const endpoint = `http://127.0.0.1:5000/api/v1/data/summary?id=${this.props.dataset_id}`;
		fetch(endpoint)
			.then(response => response.text())
			.then(data => {
				this.setState( {metadata: data} )
		})
    }

    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Info</Card.Title>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Metadata</Accordion.Header>
                            <Accordion.Body>
                                <div>{this.state.metadata}</div>
                            </Accordion.Body>
                        </Accordion.Item> 
                    </Accordion>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetMeta }