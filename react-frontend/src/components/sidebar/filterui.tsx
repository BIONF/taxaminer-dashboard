import React from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'

// Filter Tab
class FilterUI extends React.Component {
    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Filter</Card.Title>
                    <Form.Label>e-value</Form.Label>
                    <Form.Range />
                    <Form.Label>Contig Filter</Form.Label>
                    <Form.Select>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                </Card.Body>
            </Card>
        );
    } 
}

export { FilterUI }