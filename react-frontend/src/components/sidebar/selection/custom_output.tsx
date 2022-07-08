import React from "react";
import { Col } from "react-bootstrap";
import { InputGroup } from "react-bootstrap";
import Form from 'react-bootstrap/Form'
import { Z_TEXT } from "zlib";

class CustomOutput extends React.Component<any, any> {
    constructor(props: any){
		super(props);
		this.state ={ }
	}

    render() {
        return (
            <>
            <Col className="md-2" xs={6}>
                    <InputGroup className="m-2">
                        <InputGroup.Text id={this.props.id}>{this.props.name}</InputGroup.Text>
                        <Form.Control
                        placeholder="Selected a Gene to get started"
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                        contentEditable={false}
                        value={this.props.row[this.props.col]}
                    />
                </InputGroup>
            </Col>
            </>
        );
    } 
}

export default CustomOutput