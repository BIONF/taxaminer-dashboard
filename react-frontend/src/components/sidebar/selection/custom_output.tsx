import React from "react";
import { Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { InputGroup } from "react-bootstrap";
import Form from 'react-bootstrap/Form'

interface Props {
    id: string
    tooltip: string
    name: string
    row: any
    col: any
}

/**
 * Labeled filed for custom Selected Gene section
 */
class CustomOutput extends React.Component<Props, any> {
    constructor(props: any){
		super(props);
        if (props.tooltip !== undefined){
            this.state ={ tooltip: props.tooltip}
        } else {
            this.state ={ tooltip: props.name}
        }
	}

    render() {
        return (
            <>
            <Col md="auto" xs={6}>
                {this.state.tooltip !== undefined && (
                    <OverlayTrigger
                    overlay={
                        <Tooltip>
                            {this.state.tooltip}
                        </Tooltip>
                    }>
                    <InputGroup className="m-2">
                        <InputGroup.Text id={this.props.id}>{this.props.name}</InputGroup.Text>
                        <Form.Control
                        placeholder="Selected a Gene to get started"
                        contentEditable={false}
                        value={this.props.row[this.props.col]}
                        />
                    </InputGroup>
                    </OverlayTrigger>
                )}
            </Col>
            </>
        );
    } 
}

export default CustomOutput