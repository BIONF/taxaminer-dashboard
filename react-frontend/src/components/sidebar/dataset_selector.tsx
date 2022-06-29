import React from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'

// Allows the user to select a dataset
// Currently only a mockup
class DataSetSelector extends React.Component {
    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Selection</Card.Title>
                    <Form.Select aria-label="Default select example">
                        <option>Default</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetSelector }