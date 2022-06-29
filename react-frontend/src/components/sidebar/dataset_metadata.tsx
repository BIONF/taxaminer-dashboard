import React from "react";
import Card from 'react-bootstrap/Card';
import { Accordion } from "react-bootstrap";

// Metadata information
// Currently only a mockup
class DataSetMeta extends React.Component {
    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Info</Card.Title>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Metadata</Accordion.Header>
                            <Accordion.Body>
                                Upload date etc.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Assembly Information</Accordion.Header>
                            <Accordion.Body>
                                Upload date etc.
                            </Accordion.Body>
                        </Accordion.Item>   
                    </Accordion>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetMeta }