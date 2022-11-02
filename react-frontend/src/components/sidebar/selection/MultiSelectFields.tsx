import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Container } from 'react-bootstrap';
import Row from "react-bootstrap/esm/Row";

// possible options
const options = require("./field_options.json")
const animatedComponents = makeAnimated();

interface Props {
  options: any[]
  default_fields: any[]
  onFieldsChange: Function
}

/**
 * Dropdown selector for custom fields to be displayed in the sidebar
 */
class MultiSelectFields extends Component<Props, any> {

    /**
     * Pass changed dropdown values to parent
     * @param values Dropdown values (JSON)
     */
  passSelectionUp = (values: any) => {
      this.props.onFieldsChange(values)
  }

  render() {
    return (
        <Container>
            <Row>
                <Select options={this.props.options} components={animatedComponents} onChange={(e) => this.passSelectionUp(e)} isMulti defaultValue={this.props.default_fields}/>
            </Row>
    </Container>
    );
  }
}
export default MultiSelectFields;